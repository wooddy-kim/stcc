import 'dotenv/config';
import { db } from '../src/lib/server/db/client';
import { regions, courts } from '../src/lib/server/db/schema';

async function setupDatabase() {
	console.log('🚀 Setting up database...');

	try {
		// Insert regions
		console.log('📍 Inserting regions...');
		const insertedRegions = await db
			.insert(regions)
			.values([
				{ code: 'suwon', name: '수원시' },
				{ code: 'dongtan', name: '동탄시' },
				{ code: 'hwaseong', name: '화성시' }
			])
			.onConflictDoNothing()
			.returning();

		console.log(`✅ Inserted ${insertedRegions.length} regions`);

		// Get region IDs
		const allRegions = await db.select().from(regions);
		const suwonRegion = allRegions.find((r) => r.code === 'suwon');
		const hwaseongRegion = allRegions.find((r) => r.code === 'hwaseong');

		if (!suwonRegion || !hwaseongRegion) {
			throw new Error('Failed to find regions');
		}

		// Insert sample courts (나중에 실제 데이터로 교체)
		console.log('🎾 Inserting sample courts...');
		const insertedCourts = await db
			.insert(courts)
			.values([
				{
					regionId: suwonRegion.id,
					name: '수원 망포체육복합센터',
					rawName: '수원 망포체육복합센터',
					address: '경기도 수원시 영통구 망포동',
					totalCourts: 3,
					isActive: true
				},
				{
					regionId: hwaseongRegion.id,
					name: '화성 여울공원 테니스장',
					rawName: '화성 여울공원 테니스장',
					address: '경기도 화성시 동탄면',
					totalCourts: 3,
					isActive: true
				},
				{
					regionId: hwaseongRegion.id,
					name: '화성 왕배산체육공원 테니스장',
					rawName: '화성 왕배산체육공원 테니스장',
					address: '경기도 화성시 향남읍',
					totalCourts: 8,
					isActive: true
				}
			])
			.onConflictDoNothing()
			.returning();

		console.log(`✅ Inserted ${insertedCourts.length} courts`);

		console.log('✨ Database setup completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Database setup failed:', error);
		process.exit(1);
	}
}

setupDatabase();
