import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const coreLaunch = vi.fn(() => Promise.resolve({ isConnected: () => true, close: vi.fn() }));
const fullLaunch = vi.fn(() => Promise.resolve({ isConnected: () => true, close: vi.fn() }));

vi.mock('playwright-core', () => ({ chromium: { launch: coreLaunch } }));
vi.mock('@sparticuz/chromium', () => ({
	default: { args: ['--x'], executablePath: () => Promise.resolve('/tmp/chromium') }
}));
vi.mock('playwright', () => ({ chromium: { launch: fullLaunch } }));

import { BaseCrawler } from '../base-crawler';
import type { Page } from 'playwright-core';

class TestCrawler extends BaseCrawler {
	getCrawlerName() {
		return 'test';
	}
	getTargetUrls() {
		return [];
	}
	async extractReservations(_page: Page) {
		return [];
	}
	// private initBrowser를 테스트에서 호출하기 위한 노출
	expose() {
		return (this as unknown as { initBrowser(): Promise<void> }).initBrowser();
	}
}

const ORIGINAL = process.env.VERCEL;
beforeEach(() => {
	coreLaunch.mockClear();
	fullLaunch.mockClear();
});
afterEach(() => {
	if (ORIGINAL === undefined) delete process.env.VERCEL;
	else process.env.VERCEL = ORIGINAL;
});

describe('BaseCrawler.initBrowser 환경 분기', () => {
	it('VERCEL 환경 → playwright-core 사용', async () => {
		process.env.VERCEL = '1';
		await new TestCrawler().expose();
		expect(coreLaunch).toHaveBeenCalledTimes(1);
		expect(fullLaunch).not.toHaveBeenCalled();
	});

	it('로컬(VERCEL 미설정) → playwright 사용', async () => {
		delete process.env.VERCEL;
		await new TestCrawler().expose();
		expect(fullLaunch).toHaveBeenCalledTimes(1);
		expect(coreLaunch).not.toHaveBeenCalled();
	});
});
