import 'dotenv/config';
import { db } from '../src/lib/server/db/client';
import { tips } from '../src/lib/server/db/schema';
import { sql } from 'drizzle-orm';
import matter from 'gray-matter';
import { marked } from 'marked';
import { sanitizeRenderedHtml } from '../src/lib/server/markdown.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tipsDir = path.join(__dirname, '../src/content/tips');

async function seedTips() {
	const files = fs.readdirSync(tipsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');

	console.log(`Found ${files.length} tip files to seed...`);

	const rows = await Promise.all(
		files.map(async (file) => {
			const filePath = path.join(tipsDir, file);
			const raw = fs.readFileSync(filePath, 'utf-8');
			const { data: frontmatter, content } = matter(raw);

			// Render markdown to HTML
			let html = await marked(content);

			// Inject id attributes into h2/h3 headings
			html = html.replace(/<h([23])>(.*?)<\/h\1>/gi, (_, level, text) => {
				const id = text
					.toLowerCase()
					.replace(/[^a-z0-9가-힣\s]/g, '')
					.replace(/\s+/g, '-')
					.trim();
				return `<h${level} id="${id}">${text}</h${level}>`;
			});

			// Sanitize HTML
			const htmlContent = sanitizeRenderedHtml(html);

			// Extract excerpt: first non-heading paragraph
			const paragraphs = content.split('\n\n');
			const firstPara = paragraphs.find((p) => !p.trim().startsWith('#')) ?? '';
			const excerpt = firstPara
				.replace(/[#*`_[\]()]/g, '')
				.trim()
				.slice(0, 200);

			// Calculate reading time
			const wordCount = content.split(/\s+/).filter(Boolean).length;
			const readingTime = Math.max(1, Math.ceil(wordCount / 200));

			// Handle lastUpdated
			let lastUpdated: string | null = null;
			if (frontmatter.lastUpdated) {
				if (frontmatter.lastUpdated instanceof Date) {
					lastUpdated = frontmatter.lastUpdated.toISOString().slice(0, 10);
				} else {
					lastUpdated = String(frontmatter.lastUpdated);
				}
			}

			const slug = file.replace(/\.md$/, '');

			return {
				title: String(frontmatter.title ?? slug),
				slug,
				category: String(frontmatter.category ?? 'general'),
				difficulty: String(frontmatter.difficulty ?? 'beginner'),
				rawContent: content,
				htmlContent,
				excerpt: excerpt || null,
				readingTime,
				lastUpdated,
				isPublished: frontmatter.published !== false
			};
		})
	);

	try {
		await db.insert(tips).values(rows).onConflictDoUpdate({
			target: tips.slug,
			set: {
				title: sql`EXCLUDED.title`,
				htmlContent: sql`EXCLUDED.html_content`,
				rawContent: sql`EXCLUDED.raw_content`,
				excerpt: sql`EXCLUDED.excerpt`,
				readingTime: sql`EXCLUDED.reading_time`,
				category: sql`EXCLUDED.category`,
				difficulty: sql`EXCLUDED.difficulty`,
				lastUpdated: sql`EXCLUDED.last_updated`,
				updatedAt: sql`now()`
			}
		});

		console.log(`Successfully seeded ${rows.length} tips into the database.`);
		process.exit(0);
	} catch (err) {
		console.error('Failed to seed tips:', err);
		process.exit(1);
	}
}

seedTips();
