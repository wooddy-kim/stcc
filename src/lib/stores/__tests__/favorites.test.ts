import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { toggleId, favorites } from '../favorites';

describe('toggleId (순수 함수)', () => {
	it('없는 id는 추가한다', () => {
		expect(toggleId([1, 2], 3)).toEqual([1, 2, 3]);
	});

	it('있는 id는 제거한다', () => {
		expect(toggleId([1, 2, 3], 2)).toEqual([1, 3]);
	});

	it('빈 배열에 추가한다', () => {
		expect(toggleId([], 5)).toEqual([5]);
	});

	it('원본 배열을 변경하지 않는다 (불변)', () => {
		const original = [1, 2];
		toggleId(original, 3);
		expect(original).toEqual([1, 2]);
	});
});

describe('favorites store', () => {
	beforeEach(() => {
		// node 환경에 localStorage 목 주입
		const storage: Record<string, string> = {};
		vi.stubGlobal('localStorage', {
			getItem: (k: string) => storage[k] ?? null,
			setItem: (k: string, v: string) => {
				storage[k] = v;
			},
			removeItem: (k: string) => {
				delete storage[k];
			}
		});
		favorites.hydrate();
	});

	it('toggle로 추가/제거되고 localStorage에 반영된다', () => {
		favorites.toggle(7);
		expect(get(favorites)).toEqual([7]);
		expect(JSON.parse(localStorage.getItem('courtnow:favorites')!)).toEqual([7]);
		favorites.toggle(7);
		expect(get(favorites)).toEqual([]);
	});

	it('add는 중복을 만들지 않는다', () => {
		favorites.add(3);
		favorites.add(3);
		expect(get(favorites)).toEqual([3]);
	});

	it('hydrate는 localStorage의 숫자 배열을 읽는다', () => {
		localStorage.setItem('courtnow:favorites', JSON.stringify([1, 2, 9]));
		favorites.hydrate();
		expect(get(favorites)).toEqual([1, 2, 9]);
	});

	it('hydrate는 잘못된 JSON이면 빈 배열로 처리한다', () => {
		localStorage.setItem('courtnow:favorites', 'not-json');
		favorites.hydrate();
		expect(get(favorites)).toEqual([]);
	});
});
