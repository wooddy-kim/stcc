/**
 * 임시 진단 라우트 — 용인 API가 Vercel IP에서만 막히는지 확인하는 회복 모니터.
 *
 * 2026-08-10 측정 결과: 같은 시각 로컬 IP는 69~171ms 정상인데 Vercel(icn1)은
 * 단발 요청조차 응답이 없다. 용인 서버가 클라이언트 IP 단위로 차단/스로틀링한다.
 * 화성 origin이 대조군이다(화성은 정상이면 Vercel 이그레스 문제가 아니라는 뜻).
 *
 * 지속 부하 측정 기능은 제거했다 — 측정 자체가 차단을 유발/악화시킨다.
 * 요청당 타임아웃을 4초로 줄여, 막혀 있어도 함수가 60초를 넘기지 않고 결과를 돌려준다.
 * 차단이 풀린 것을 확인하면 이 라우트는 삭제할 것.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assertAuthorized } from '$lib/server/cron-auth';
import { db } from '$lib/server/db/client';
import { courtApiMappings } from '$lib/server/db/schema';
import { eq, ne, and } from 'drizzle-orm';

export const config = {
	regions: ['icn1'],
	maxDuration: 60
};

const YONGIN_URL =
	'https://publicsports.yongin.go.kr/publicsports/sports/selectRegistTimeByChosenDateFcltyRceptResveApply.do';
const HWASEONG_URL = 'https://yeyak.hscity.go.kr/stadium/stadiumReserveUseList.do';

async function timed(url: string, body: string): Promise<number | string> {
	const started = Date.now();
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 4000);
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
			body,
			signal: controller.signal
		});
		await res.arrayBuffer(); // 본문까지 다 받아야 실제 왕복 시간이다
		return res.ok ? Date.now() - started : `HTTP ${res.status} (${Date.now() - started}ms)`;
	} catch (err) {
		return `${(err as Error).name} (${Date.now() - started}ms)`;
	} finally {
		clearTimeout(timeoutId);
	}
}

function summarize(samples: (number | string)[]) {
	const ok = samples.filter((s): s is number => typeof s === 'number').sort((a, b) => a - b);
	return {
		samples,
		ok: ok.length,
		min: ok[0] ?? null,
		median: ok[Math.floor(ok.length / 2)] ?? null,
		max: ok[ok.length - 1] ?? null
	};
}

export const GET: RequestHandler = async ({ request, url }) => {
	assertAuthorized(request);

	// 차단을 악화시키지 않도록 상한을 낮게 묶는다
	const n = Math.min(Number(url.searchParams.get('n') ?? 3), 5);
	const yearMonth = new Date().toISOString().slice(0, 7);

	// 실제 크롤러가 쓰는 매핑에서 유효한 id를 뽑는다 (하드코딩하면 매달 썩는다)
	const [yongin] = await db
		.select()
		.from(courtApiMappings)
		.where(and(eq(courtApiMappings.yearMonth, yearMonth), ne(courtApiMappings.facilityKey, '')))
		.limit(1);
	const [hwaseong] = await db
		.select()
		.from(courtApiMappings)
		.where(eq(courtApiMappings.yearMonth, 'STATIC'))
		.limit(1);

	if (!yongin || !hwaseong) {
		return json(
			{ error: `매핑 없음 (yongin=${!!yongin}, hwaseong=${!!hwaseong})` },
			{ status: 500 }
		);
	}

	const day = `${yearMonth.replace('-', '')}15`;
	const yBody = `dateVal=${day}&resveId=${yongin.apiCourtId}`;
	const hBody = `stadiumIdx=${hwaseong.apiCourtId}&searchYear=${yearMonth.slice(0, 4)}&searchMonth=${yearMonth.slice(5, 7)}`;

	// 1) 순차 — 순수 왕복 시간
	const yoninSeq: (number | string)[] = [];
	for (let i = 0; i < n; i++) yoninSeq.push(await timed(YONGIN_URL, yBody));
	const hwaseongSeq: (number | string)[] = [];
	for (let i = 0; i < n; i++) hwaseongSeq.push(await timed(HWASEONG_URL, hBody));

	const yonginOk = yoninSeq.some((s) => typeof s === 'number');
	const hwaseongOk = hwaseongSeq.some((s) => typeof s === 'number');

	return json({
		region: process.env.VERCEL_REGION ?? 'local',
		probe: { yearMonth, yonginResveId: yongin.apiCourtId, hwaseongStadiumIdx: hwaseong.apiCourtId },
		verdict: yonginOk
			? '용인 응답 정상 — 차단 해제됨'
			: hwaseongOk
				? '용인만 막힘 — 용인 서버가 이 IP를 차단 중 (Vercel 이그레스는 정상)'
				: '두 origin 모두 응답 없음 — 네트워크/함수 문제 의심',
		yonginSequential: summarize(yoninSeq),
		hwaseongSequential: summarize(hwaseongSeq)
	});
};
