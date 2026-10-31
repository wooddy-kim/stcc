import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		// drizzle-kit은 직접 연결(port 5432)이 필요 — pooler(6543)는 DDL 불가
		url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!
	}
});
