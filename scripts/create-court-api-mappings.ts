/**
 * court_api_mappings 테이블 직접 생성 스크립트
 * drizzle-kit push가 CHECK constraint 버그로 실패할 때 사용
 *
 * 실행: npx tsx scripts/create-court-api-mappings.ts
 */
import { config } from 'dotenv';
config();

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
	console.log('court_api_mappings 테이블 생성 중...');

	await sql`
		CREATE TABLE IF NOT EXISTS court_api_mappings (
			id          SERIAL PRIMARY KEY,
			facility_key VARCHAR(20) NOT NULL,
			year_month  VARCHAR(7) NOT NULL DEFAULT 'STATIC',
			api_court_id INTEGER NOT NULL,
			court_number VARCHAR(10) NOT NULL,
			created_at  TIMESTAMP DEFAULT NOW(),
			CONSTRAINT court_api_mapping_unique
				UNIQUE (facility_key, year_month, api_court_id)
		)
	`;

	await sql`
		CREATE INDEX IF NOT EXISTS court_api_mapping_facility_month_idx
			ON court_api_mappings (facility_key, year_month)
	`;

	console.log('✅ 테이블 생성 완료');
	await sql.end();
}

main().catch((err) => {
	console.error('실패:', err);
	process.exit(1);
});
