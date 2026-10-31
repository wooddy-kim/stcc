import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { assertAuthorized } from '../cron-auth';

const ORIGINAL = process.env.CRON_SECRET;

function req(authHeader?: string): Request {
	const headers: Record<string, string> = {};
	if (authHeader) headers.authorization = authHeader;
	return new Request('http://localhost/api/cron/x', { headers });
}

beforeEach(() => {
	process.env.CRON_SECRET = 'topsecret';
});
afterEach(() => {
	if (ORIGINAL === undefined) delete process.env.CRON_SECRET;
	else process.env.CRON_SECRET = ORIGINAL;
});

describe('assertAuthorized', () => {
	it('CRON_SECRET 미설정 → 500', () => {
		delete process.env.CRON_SECRET;
		try {
			assertAuthorized(req('Bearer topsecret'));
			expect.fail('throw 되어야 함');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('헤더 누락 → 401', () => {
		try {
			assertAuthorized(req());
			expect.fail('throw 되어야 함');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('토큰 불일치 → 401', () => {
		try {
			assertAuthorized(req('Bearer wrong'));
			expect.fail('throw 되어야 함');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('올바른 Bearer 토큰 → 통과(throw 없음)', () => {
		expect(() => assertAuthorized(req('Bearer topsecret'))).not.toThrow();
	});
});
