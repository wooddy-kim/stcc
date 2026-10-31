import { describe, it, expect } from 'vitest';

import { createLimiter } from '../api-based/request-limiter';

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('createLimiter', () => {
	it('동시 실행 수가 상한을 넘지 않는다', async () => {
		const limit = createLimiter(3);
		let inFlight = 0;
		let maxInFlight = 0;

		const tasks = Array.from({ length: 12 }, (_, i) =>
			limit(async () => {
				inFlight++;
				maxInFlight = Math.max(maxInFlight, inFlight);
				await sleep(10);
				inFlight--;
				return i;
			})
		);

		const results = await Promise.all(tasks);

		expect(maxInFlight).toBeLessThanOrEqual(3);
		expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
	});

	it('minIntervalMs를 주면 요청 간격이 그만큼 벌어진다', async () => {
		const limit = createLimiter(5, 20);
		const startedAt: number[] = [];
		const t0 = Date.now();

		await Promise.all(
			Array.from({ length: 5 }, () =>
				limit(async () => {
					startedAt.push(Date.now() - t0);
				})
			)
		);

		// 동시 5개라 간격이 없으면 전부 0ms에 몰린다. 간격이 걸리면 20ms씩 벌어진다.
		expect(startedAt).toHaveLength(5);
		expect(startedAt[4]).toBeGreaterThanOrEqual(70);
	});

	it('minIntervalMs가 0이면(기본값) 간격 없이 동시성만 제한한다', async () => {
		const limit = createLimiter(5);
		const t0 = Date.now();
		await Promise.all(Array.from({ length: 5 }, () => limit(async () => {})));
		expect(Date.now() - t0).toBeLessThan(50);
	});

	it('실패한 작업도 슬롯을 반납하고 에러는 호출자에게 전파된다', async () => {
		const limit = createLimiter(1);
		const order: string[] = [];

		const failing = limit(async () => {
			order.push('fail');
			throw new Error('boom');
		});
		const following = limit(async () => {
			order.push('after');
			return 'ok';
		});

		await expect(failing).rejects.toThrow('boom');
		await expect(following).resolves.toBe('ok');
		expect(order).toEqual(['fail', 'after']);
	});
});
