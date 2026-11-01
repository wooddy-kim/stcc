import { describe, it, expect } from 'vitest';
import { courtSeo, regionSeo } from '../court-seo';

describe('courtSeo', () => {
	it('시 이름과 "테니스장"을 붙인다', () => {
		const { title } = courtSeo({
			name: '돌모루',
			regionName: '화성시',
			address: null,
			totalCourts: null
		});
		expect(title).toBe('화성 돌모루 테니스장 예약 · 빈 코트 실시간 확인 | CourtNow');
	});

	it('이름에 이미 있으면 시 이름·"테니스장"을 중복하지 않는다', () => {
		const { title } = courtSeo({
			name: '용인골드테니스장',
			regionName: '용인시',
			address: null,
			totalCourts: 4
		});
		expect(title).toBe('용인골드테니스장 예약 · 빈 코트 실시간 확인 | CourtNow');
	});

	it('없는 값은 description에 null로 찍히지 않는다', () => {
		const { description } = courtSeo({
			name: '포이테니스장',
			regionName: null,
			address: null,
			totalCourts: null
		});
		expect(description).not.toMatch(/null|undefined/);
		expect(description).toBe(
			'포이테니스장의 오늘 빈 시간을 실시간으로 확인하세요. 예약 방법·요금·주차 안내.'
		);
	});

	it('주소·코트 수가 있으면 넣는다', () => {
		const { description } = courtSeo({
			name: '망포복합체육센터',
			regionName: '수원시',
			address: '수원시 영통구',
			totalCourts: 6
		});
		expect(description).toContain('수원시 영통구 위치, 코트 6면.');
	});
});

describe('regionSeo', () => {
	it('시 이름에서 "시"를 떼고 코트 수를 넣는다', () => {
		const { title, heading } = regionSeo('용인시', 12);
		expect(title).toBe('용인 테니스장 예약 · 공공 테니스장 12곳 빈 코트 실시간 | CourtNow');
		expect(heading).toBe('용인 공공 테니스장 예약 현황');
	});
});
