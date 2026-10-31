import { writable } from 'svelte/store';

const STORAGE_KEY = 'courtnow:favorites';

const hasStorage = (): boolean => typeof localStorage !== 'undefined';

/** 순수 토글: id가 있으면 제거, 없으면 추가 (원본 불변) */
export function toggleId(ids: number[], id: number): number[] {
	return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

function readStorage(): number[] {
	if (!hasStorage()) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === 'number') : [];
	} catch {
		return [];
	}
}

function writeStorage(ids: number[]): void {
	if (!hasStorage()) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
	} catch {
		// 용량 초과 등은 무시
	}
}

function createFavorites() {
	const { subscribe, set, update } = writable<number[]>([]);

	return {
		subscribe,
		/** localStorage → store (클라이언트 마운트 시 1회 호출) */
		hydrate: () => set(readStorage()),
		toggle: (id: number) =>
			update((ids) => {
				const next = toggleId(ids, id);
				writeStorage(next);
				return next;
			}),
		add: (id: number) =>
			update((ids) => {
				if (ids.includes(id)) return ids;
				const next = [...ids, id];
				writeStorage(next);
				return next;
			}),
		remove: (id: number) =>
			update((ids) => {
				const next = ids.filter((x) => x !== id);
				writeStorage(next);
				return next;
			})
	};
}

export const favorites = createFavorites();
