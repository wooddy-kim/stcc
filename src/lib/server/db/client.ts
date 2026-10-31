import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set');
}

// NOTE: 서버리스(Vercel)에서는 인스턴스당 최대 1개 연결만 사용. 다중 인스턴스 환경의 연결 과다 방지.
const client = postgres(process.env.DATABASE_URL, {
	max: 1, // 서버리스 인스턴스당 최대 1개 연결
	idle_timeout: 20, // 20초 유휴 후 연결 해제
	connect_timeout: 10
});
export const db = drizzle({ client, schema });
