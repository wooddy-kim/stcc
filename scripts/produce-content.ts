import 'dotenv/config';
import { db } from '../src/lib/server/db/client';
import { tips } from '../src/lib/server/db/schema';
import { sql } from 'drizzle-orm';
import matter from 'gray-matter';
import { marked } from 'marked';
import { sanitizeRenderedHtml } from '../src/lib/server/markdown.js';
import fs from 'fs';
import path from 'path';

const CATEGORIES = [
	'serving',
	'strokes',
	'strategy',
	'movement',
	'mental-game',
	'training',
	'lifestyle',
	'equipment'
] as const;

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toKebabCase(str: string): string {
	return str
		.toLowerCase()
		.replace(/[가-힣]/g, '') // Remove Korean characters
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

async function searchYouTube(
	query: string,
	apiKey: string,
	channelId?: string
): Promise<string | null> {
	const params: Record<string, string> = {
		part: 'snippet',
		q: query,
		type: 'video',
		maxResults: '1',
		key: apiKey
	};
	if (channelId) params.channelId = channelId;

	const url = `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams(params)}`;
	const res = await fetch(url);
	const data = await res.json();
	return (data.items?.[0]?.id?.videoId as string) ?? null;
}

async function main() {
	const args = process.argv.slice(2);
	const fileIdx = args.indexOf('--file');

	if (fileIdx === -1 || !args[fileIdx + 1]) {
		console.error('Usage: tsx scripts/produce-content.ts --file /tmp/content-{slug}.md');
		process.exit(1);
	}

	const filePath = args[fileIdx + 1];

	if (!fs.existsSync(filePath)) {
		console.error(`Error: File not found: ${filePath}`);
		process.exit(1);
	}

	const raw = fs.readFileSync(filePath, 'utf-8');
	const { data: frontmatter, content } = matter(raw);

	// Validate required fields
	const requiredFields = ['title', 'slug', 'category', 'difficulty', 'date', 'youtubeQuery'];
	const missing = requiredFields.filter((f) => !frontmatter[f]);
	if (missing.length > 0) {
		console.error(`Error: Missing required frontmatter fields: ${missing.join(', ')}`);
		process.exit(1);
	}

	// Validate slug with fallback
	let slug = String(frontmatter.slug);
	if (!SLUG_PATTERN.test(slug)) {
		const fallback = toKebabCase(slug || String(frontmatter.title));
		if (!fallback || !SLUG_PATTERN.test(fallback)) {
			console.error(
				`Error: Invalid slug "${slug}" and could not generate a valid fallback. Use lowercase letters, numbers, and hyphens only.`
			);
			process.exit(1);
		}
		console.warn(`Warning: slug "${slug}" is invalid, using fallback "${fallback}"`);
		slug = fallback;
	}

	// Validate category
	const category = String(frontmatter.category);
	if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
		console.error(
			`Error: Invalid category "${category}". Must be one of: ${CATEGORIES.join(', ')}`
		);
		process.exit(1);
	}

	// Validate difficulty
	const difficulty = String(frontmatter.difficulty);
	if (!DIFFICULTIES.includes(difficulty as (typeof DIFFICULTIES)[number])) {
		console.error(
			`Error: Invalid difficulty "${difficulty}". Must be one of: ${DIFFICULTIES.join(', ')}`
		);
		process.exit(1);
	}

	const title = String(frontmatter.title);
	const youtubeQuery = String(frontmatter.youtubeQuery);
	const date = String(frontmatter.date);

	// YouTube search
	let videoId: string | null = null;
	const apiKey = process.env.YOUTUBE_API_KEY;

	if (!apiKey) {
		console.info('Info: YOUTUBE_API_KEY not set, skipping YouTube search.');
	} else {
		// Load channels.json
		const channelsPath = path.join(process.cwd(), 'scripts/content-producer/channels.json');
		let channels: Array<{ id: string; name: string; priority: number }> = [];

		if (fs.existsSync(channelsPath)) {
			try {
				const channelsData = JSON.parse(fs.readFileSync(channelsPath, 'utf-8'));
				channels = ((channelsData.channels as typeof channels) ?? [])
					.filter((c) => c.id && c.id !== 'UC_CHANNEL_ID_HERE')
					.sort((a, b) => a.priority - b.priority);
			} catch {
				console.warn('Warning: Failed to parse channels.json, skipping channel search.');
			}
		}

		// Search each channel in priority order
		for (const channel of channels) {
			try {
				videoId = await searchYouTube(youtubeQuery, apiKey, channel.id);
				if (videoId) {
					console.info(`Found video in channel "${channel.name}": ${videoId}`);
					break;
				}
			} catch (e) {
				console.warn(`Warning: YouTube search failed for channel "${channel.name}":`, e);
			}
		}

		// Fallback: global search
		if (!videoId) {
			try {
				videoId = await searchYouTube(youtubeQuery, apiKey);
				if (videoId) {
					console.info(`Found video via global search: ${videoId}`);
				}
			} catch (e) {
				console.warn('Warning: YouTube global search failed:', e);
			}
		}

		if (!videoId) {
			console.warn('Warning: No YouTube video found, proceeding without embed.');
		}
	}

	// Convert markdown to HTML
	let html = await marked(content);

	// Inject id attributes into h2/h3 headings (seed-tips.ts pattern)
	html = html.replace(/<h([23])>(.*?)<\/h\1>/gi, (_, level, text) => {
		const id = text
			.toLowerCase()
			.replace(/[^a-z0-9가-힣\s]/g, '')
			.replace(/\s+/g, '-')
			.trim();
		return `<h${level} id="${id}">${text}</h${level}>`;
	});

	// Append YouTube embed at end of HTML (blank lines prevent marked p-wrapping)
	if (videoId) {
		html +=
			`\n<div class="video-container">\n` +
			`<iframe src="https://www.youtube.com/embed/${videoId}" ` +
			`allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ` +
			`allowfullscreen></iframe>\n` +
			`</div>\n`;
	}

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

	// DB UPSERT
	try {
		await db
			.insert(tips)
			.values({
				title,
				slug,
				category,
				difficulty,
				rawContent: content,
				htmlContent,
				excerpt: excerpt || null,
				readingTime,
				lastUpdated: date,
				isPublished: true
			})
			.onConflictDoUpdate({
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

		console.log(`✓ Saved "${title}" (slug: ${slug})`);
		if (videoId) {
			console.log(`  YouTube: https://www.youtube.com/watch?v=${videoId}`);
		}
		console.log(`  View at: /content/${slug}`);
		fs.unlinkSync(filePath);
		process.exit(0);
	} catch (err) {
		console.error('Error: Failed to save to database:', err);
		process.exit(1);
	}
}

main();
