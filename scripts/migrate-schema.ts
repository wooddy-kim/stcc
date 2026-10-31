/**
 * DB 스키마 마이그레이션 스크립트
 * drizzle-kit push 버그 우회용 - ALTER TABLE로 직접 컬럼 추가
 */
import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function addColumnIfNotExists(
	table: string,
	column: string,
	definition: string
): Promise<void> {
	const rows = await sql`
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = ${table} AND column_name = ${column}
	`;

	if (rows.length === 0) {
		await sql.unsafe(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
		console.log(`  ✅ ${table}.${column} 추가됨`);
	} else {
		console.log(`  ⏭️  ${table}.${column} 이미 존재 (skip)`);
	}
}

async function main() {
	console.log('=== DB 스키마 마이그레이션 시작 ===\n');

	console.log('📍 regions 테이블 컬럼 추가...');
	await addColumnIfNotExists('regions', 'crawler_type', "VARCHAR(20) DEFAULT 'PLAYWRIGHT'");
	await addColumnIfNotExists('regions', 'api_url', 'TEXT');
	await addColumnIfNotExists('regions', 'months_to_fetch', 'INTEGER DEFAULT 2');
	await addColumnIfNotExists('regions', 'batch_size', 'INTEGER DEFAULT 10');

	console.log('\n🎾 courts 테이블 컬럼 추가...');
	await addColumnIfNotExists('courts', 'facility_key', 'VARCHAR(20)');
	await addColumnIfNotExists('courts', 'court_sort_mode', "VARCHAR(10) DEFAULT 'numeric'");
	await addColumnIfNotExists('courts', 'overview', 'TEXT');
	await addColumnIfNotExists('courts', 'review_content', 'TEXT');

	console.log('\n✨ 마이그레이션 완료!');
	await sql.end();
	process.exit(0);
}

main().catch(async (err) => {
	console.error('❌ 마이그레이션 실패:', err);
	await sql.end();
	process.exit(1);
});
