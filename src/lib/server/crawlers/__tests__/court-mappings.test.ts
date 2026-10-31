import { describe, it, expect } from 'vitest';
import { sortCourtNumbers, formatCourtNumbers } from '../court-mappings';

describe('sortCourtNumbers', () => {
	it('숫자를 올바른 순서로 정렬한다', () => {
		expect(sortCourtNumbers(['10', '2', '1'])).toEqual(['1', '2', '10']);
	});

	it('숫자가 아닌 경우 원래 순서를 유지한다', () => {
		expect(sortCourtNumbers(['A', 'B'])).toEqual(['A', 'B']);
	});

	it('빈 배열을 처리한다', () => {
		expect(sortCourtNumbers([])).toEqual([]);
	});

	it('단일 항목 배열을 처리한다', () => {
		expect(sortCourtNumbers(['5'])).toEqual(['5']);
	});
});

describe('formatCourtNumbers', () => {
	it('쉼표 구분 코트 번호를 포맷팅한다', () => {
		expect(formatCourtNumbers('1,3,5')).toBe('코트 1, 3, 5');
	});

	it('빈 문자열이면 빈 문자열을 반환한다', () => {
		expect(formatCourtNumbers('')).toBe('');
	});

	it('단일 코트 번호를 포맷팅한다', () => {
		expect(formatCourtNumbers('1')).toBe('코트 1');
	});
});
