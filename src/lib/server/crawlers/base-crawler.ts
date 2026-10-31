import type { Browser, Page } from 'playwright-core';
import type { CrawlResult, RawReservation, CrawlError } from './types';
import { ErrorType } from './types';

/**
 * 크롤러 추상 클래스
 * 모든 크롤러는 이 클래스를 상속받아 구현
 */
export abstract class BaseCrawler {
	private browser: Browser | null = null;
	private maxRetries = 3;
	private retryDelay = 2000; // 2초

	/**
	 * 크롤러 이름 (로깅용)
	 */
	abstract getCrawlerName(): string;

	/**
	 * 크롤링할 대상 URL 목록 또는 URL 생성 로직
	 */
	abstract getTargetUrls(): string[];

	/**
	 * 페이지에서 예약 데이터 추출
	 */
	abstract extractReservations(page: Page): Promise<RawReservation[]>;

	/**
	 * 크롤링 실행 (공통 플로우)
	 */
	async crawl(): Promise<CrawlResult> {
		const startTime = Date.now();
		const source = this.getCrawlerName();

		try {
			console.log(`[${source}] 크롤링 시작`);

			// 브라우저 시작
			await this.initBrowser();

			// 모든 URL에서 데이터 수집
			const allReservations: RawReservation[] = [];
			const urls = this.getTargetUrls();

			for (const url of urls) {
				console.log(`[${source}] URL 크롤링: ${url}`);
				const reservations = await this.crawlUrl(url);
				allReservations.push(...reservations);
			}

			// 브라우저 종료
			await this.closeBrowser();

			const duration = Date.now() - startTime;
			console.log(`[${source}] 크롤링 완료: ${allReservations.length}건, ${duration}ms`);

			return {
				success: true,
				source,
				reservations: allReservations,
				recordsCount: allReservations.length,
				duration
			};
		} catch (error) {
			// 에러 처리
			await this.closeBrowser();

			const crawlError = this.handleError(error);
			const duration = Date.now() - startTime;

			console.error(`[${source}] 크롤링 실패:`, crawlError.message);

			return {
				success: false,
				source,
				reservations: [],
				recordsCount: 0,
				duration,
				error: crawlError
			};
		}
	}

	/**
	 * 단일 URL 크롤링 (재시도 로직 포함)
	 */
	private async crawlUrl(url: string): Promise<RawReservation[]> {
		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
			try {
				// 브라우저가 없거나 연결이 끊어진 경우 재시작
				if (!this.browser || !this.browser.isConnected()) {
					console.log(`[${this.getCrawlerName()}] 브라우저 재시작...`);
					await this.closeBrowser(); // 기존 브라우저 정리
					await this.initBrowser(); // 새 브라우저 시작
				}

				if (!this.browser) {
					throw new Error('Browser not initialized');
				}

				const page = await this.browser.newPage();

				// 브라우저 헤더 설정 (봇 차단 우회)
				await page.setExtraHTTPHeaders({
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					Accept:
						'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
					'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
					'Accept-Encoding': 'gzip, deflate, br',
					Connection: 'keep-alive',
					'Upgrade-Insecure-Requests': '1',
					'Sec-Fetch-Dest': 'document',
					'Sec-Fetch-Mode': 'navigate',
					'Sec-Fetch-Site': 'none',
					'Sec-Fetch-User': '?1',
					'Cache-Control': 'max-age=0'
				});

				// 페이지 로드 (타임아웃 120초, DOM 로드 완료 시 진행)
				// 'domcontentloaded'는 모든 리소스를 기다리지 않고 DOM만 준비되면 진행
				await page.goto(url, {
					waitUntil: 'domcontentloaded',
					timeout: 120000
				});

				// JavaScript 렌더링 대기 (DOM 로드 후 추가 시간)
				await page.waitForTimeout(5000);

				// 데이터 추출
				const reservations = await this.extractReservations(page);

				await page.close();

				return reservations;
			} catch (error) {
				lastError = error as Error;
				console.warn(`[${this.getCrawlerName()}] 시도 ${attempt}/${this.maxRetries} 실패:`, error);

				if (attempt < this.maxRetries) {
					// 지수 백오프
					const delay = this.retryDelay * Math.pow(2, attempt - 1);
					console.log(`[${this.getCrawlerName()}] ${delay}ms 후 재시도...`);
					await this.sleep(delay);
				}
			}
		}

		throw lastError || new Error('Unknown error during crawling');
	}

	/**
	 * 브라우저 초기화
	 * Vercel(서버리스)에서는 playwright-core + @sparticuz/chromium,
	 * 로컬에서는 번들된 playwright를 사용한다.
	 */
	private async initBrowser(): Promise<void> {
		try {
			if (process.env.VERCEL) {
				const { chromium } = await import('playwright-core');
				const sparticuz = (await import('@sparticuz/chromium')).default;
				this.browser = await chromium.launch({
					args: [...sparticuz.args, '--single-process'],
					executablePath: await sparticuz.executablePath(),
					headless: true
				});
			} else {
				const { chromium } = await import('playwright');
				// playwright는 자체 playwright-core 사본을 번들하므로, 타입 import 대상인
				// 독립 playwright-core 패키지와 명목적(nominal) 타입 불일치가 발생한다.
				// 런타임에는 Browser 인터페이스가 구조적으로 동일하므로 이 캐스트는 안전하다.
				this.browser = (await chromium.launch({
					headless: true,
					args: [
						'--no-sandbox',
						'--disable-setuid-sandbox',
						'--disable-blink-features=AutomationControlled',
						'--disable-dev-shm-usage',
						'--disable-accelerated-2d-canvas',
						'--disable-gpu',
						'--disable-software-rasterizer',
						'--disable-extensions',
						'--disable-background-networking',
						'--disable-sync',
						'--metrics-recording-only',
						'--no-first-run',
						'--disable-default-apps',
						'--mute-audio',
						'--no-zygote',
						'--single-process'
					]
				})) as unknown as Browser;
			}
		} catch (error) {
			console.error(`[${this.getCrawlerName()}] 브라우저 시작 실패:`, error);
			throw new Error(
				`브라우저를 시작할 수 없습니다. Playwright Chromium이 올바르게 설치되었는지 확인하세요: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * 브라우저 종료
	 */
	private async closeBrowser(): Promise<void> {
		if (this.browser) {
			await this.browser.close();
			this.browser = null;
		}
	}

	/**
	 * 에러 처리
	 */
	private handleError(error: unknown): CrawlError {
		const err = error as Error;

		let errorType = ErrorType.UNKNOWN_ERROR;

		if (err.message.includes('Timeout')) {
			errorType = ErrorType.TIMEOUT_ERROR;
		} else if (err.message.includes('net::')) {
			errorType = ErrorType.NETWORK_ERROR;
		} else if (err.message.includes('selector')) {
			errorType = ErrorType.SELECTOR_NOT_FOUND;
		} else if (err.message.includes('parse')) {
			errorType = ErrorType.PARSING_ERROR;
		}

		return {
			type: errorType,
			message: err.message,
			stack: err.stack
		};
	}

	/**
	 * 지연 함수
	 */
	protected sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
