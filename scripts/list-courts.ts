import { config } from 'dotenv';
config();

async function main() {
	const { db } = await import('../src/lib/server/db/client.js');
	const { courts } = await import('../src/lib/server/db/schema.js');
	const rows = await db.select({ id: courts.id, name: courts.name }).from(courts);
	console.log(JSON.stringify(rows, null, 2));
	process.exit(0);
}
main();
