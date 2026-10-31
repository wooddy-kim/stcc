/**
 * 동일 origin으로 나가는 동시 요청 수와 요청 속도를 제한하는 단순 세마포어.
 * 상한 초과 시 FIFO 큐에서 대기하고, 작업 성공/실패와 무관하게 슬롯을 반납한다.
 *
 * `minIntervalMs`를 주면 동시성과 별개로 요청 간 최소 간격까지 강제한다.
 * 동시성만 낮추면 순간 부하만 줄 뿐 초당 요청 수는 그대로다 — 동시 5개라도
 * 응답이 100ms면 초당 50건이 나간다. 요청률로 클라이언트를 차단하는
 * origin(용인)에는 동시성 제한이 듣지 않으므로 간격을 따로 걸어야 한다.
 */
export function createLimiter(maxConcurrent: number, minIntervalMs = 0) {
	let active = 0;
	const waiting: (() => void)[] = [];
	// 다음 요청을 내보낼 수 있는 가장 이른 시각. 슬롯을 잡는 순서대로 예약해
	// 동시에 깨어난 작업들이 같은 시각에 몰리지 않게 한다.
	let nextSlotAt = 0;

	const release = () => {
		active--;
		const next = waiting.shift();
		if (next) next();
	};

	return async function limit<T>(task: () => Promise<T>): Promise<T> {
		if (active >= maxConcurrent) {
			await new Promise<void>((resolve) => waiting.push(resolve));
		}
		active++;
		try {
			if (minIntervalMs > 0) {
				const now = Date.now();
				const startAt = Math.max(now, nextSlotAt);
				nextSlotAt = startAt + minIntervalMs;
				if (startAt > now) {
					await new Promise((resolve) => setTimeout(resolve, startAt - now));
				}
			}
			return await task();
		} finally {
			release();
		}
	};
}
