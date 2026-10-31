import { config } from 'dotenv';

async function finalCheck() {
	config();

	const { db } = await import('../src/lib/server/db/client.js');
	const { courts, reservations, regions } = await import('../src/lib/server/db/schema.js');
	const { eq, sql } = await import('drizzle-orm');

	console.log('=== 최종 데이터 상태 확인 ===\n');

	// 지역별 통계
	const allRegions = await db.select().from(regions);

	for (const region of allRegions) {
		console.log(`📍 ${region.name} (${region.code})`);

		const regionCourts = await db.select().from(courts).where(eq(courts.regionId, region.id));

		for (const court of regionCourts) {
			const reservationCount = await db
				.select({
					count: sql<number>`count(*)::int`,
					available: sql<number>`count(*) FILTER (WHERE status = 'available')::int`,
					reserved: sql<number>`count(*) FILTER (WHERE status = 'reserved')::int`
				})
				.from(reservations)
				.where(eq(reservations.courtId, court.id));

			const stats = reservationCount[0];

			console.log(`  🎾 ${court.name}`);
			console.log(`     주소: ${court.address}`);
			console.log(`     코트 수: ${court.totalCourts}개`);
			console.log(`     예약 데이터: ${stats.count}건`);
			console.log(`       ├─ 예약 가능: ${stats.available}건`);
			console.log(`       └─ 예약됨: ${stats.reserved}건`);
		}
		console.log('');
	}

	// 전체 통계
	const totalReservations = await db
		.select({
			count: sql<number>`count(*)::int`
		})
		.from(reservations);

	console.log('=== 전체 통계 ===');
	console.log(`지역: ${allRegions.length}개`);
	console.log(`테니스장: ${(await db.select().from(courts)).length}개`);
	console.log(`총 예약 데이터: ${totalReservations[0].count}건`);

	process.exit(0);
}

finalCheck();
