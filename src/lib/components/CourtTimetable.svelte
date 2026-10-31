<script lang="ts">
	import { onMount } from 'svelte';
	import DayBar from '$lib/components/DayBar.svelte';
	import {
		MAX_DAYS_AHEAD,
		addDays,
		faceCount,
		kstNow,
		timetableDays,
		type Slot,
		type TimetableDay
	} from '$lib/utils/time-first';

	interface Row extends Slot {
		day: string;
	}

	export let courtId: number;

	const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

	let days: TimetableDay<Row>[] = [];
	let loading = true;
	let failed = false;
	let highlight: string | null = null;
	let listEl: HTMLElement;

	function dateLabel(d: string, today: string): string {
		const [y, m, day] = d.split('-').map(Number);
		const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
		const rel = d === today ? ' (오늘)' : d === addDays(today, 1) ? ' (내일)' : '';
		return `${m}.${day} ${weekday}${rel}`;
	}

	function slotLabel(s: Row): string {
		const n = faceCount(s.availableCourts);
		return `${Number(s.startTime.slice(0, 2))}시 ${n !== null ? `${n}면` : '가능'}`;
	}

	let today = '';
	let labels = new Map<string, string>();

	async function load() {
		loading = true;
		failed = false;
		const now = kstNow();
		today = now.date;
		const end = addDays(now.date, MAX_DAYS_AHEAD);
		try {
			const res = await fetch(
				`/api/reservations?courtIds=${courtId}&startDate=${now.date}&endDate=${end}`
			);
			const json = await res.json();
			if (!res.ok || !json.success) throw new Error(json.error ?? res.statusText);
			const rows: Row[] = json.data;
			days = timetableDays(rows, now, MAX_DAYS_AHEAD + 1);
			labels = new Map(days.map((d) => [d.day, dateLabel(d.day, today)]));
		} catch (err) {
			console.error('Failed to fetch court timetable:', err);
			failed = true;
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		const param = new URLSearchParams(window.location.search).get('date');
		highlight = param && /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : null;
		await load();
		if (highlight) {
			listEl
				?.querySelector(`[data-day="${highlight}"]`)
				?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		}
	});
</script>

<section id="timetable" class="timetable" aria-labelledby="timetable-title">
	<h2 id="timetable-title" class="timetable-title">날짜별 빈 시간</h2>

	{#if loading}
		<p class="notice" aria-busy="true">불러오는 중…</p>
	{:else if failed}
		<div class="notice">
			<p>예약 현황을 불러오지 못했어요</p>
			<button type="button" class="retry" on:click={load}>다시 시도</button>
		</div>
	{:else if days.every((d) => !d.reported)}
		<div class="notice"><p>이 코트는 아직 예약 현황을 수집하지 않아요</p></div>
	{:else}
		<ul class="day-list" bind:this={listEl}>
			{#each days as d (d.day)}
				<li
					class="day-row"
					class:dim={d.slots.length === 0}
					class:highlight={d.day === highlight}
					data-day={d.day}
				>
					<div class="day-head">
						<span class="day-label">{labels.get(d.day)}</span>
						<span class="day-summary">
							{#if d.slots.length > 0}
								{#each d.slots as slot (slot.startTime)}
									<span class="slot">{slotLabel(slot)}</span>
								{/each}
							{:else}
								{d.reported ? '빈 시간 없음' : '예약 정보 없음'}
							{/if}
						</span>
					</div>
					<DayBar slots={d.slots} />
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.timetable {
		margin: var(--space-6) 0;
		scroll-margin-top: 80px;
	}

	.timetable-title {
		margin: 0 0 var(--space-3);
		font-size: var(--text-xl);
		font-weight: var(--font-bold);
	}

	.day-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}

	.day-row {
		padding: var(--space-3);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
	}

	.day-row.dim {
		background: var(--color-bg-secondary);
	}

	.day-row.dim :global(.day-bar .cells) {
		opacity: 0.6;
	}

	.day-row.highlight {
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 2px var(--color-primary-100);
	}

	.day-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-3);
		margin-bottom: var(--space-2);
	}

	.day-label {
		flex: none;
		font-weight: var(--font-bold);
	}

	.day-summary {
		flex-basis: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-primary-700);
		font-weight: var(--font-semibold);
	}

	.slot {
		white-space: nowrap;
	}

	.day-row.dim .day-label,
	.day-row.dim .day-summary {
		color: var(--color-text-secondary);
		font-weight: var(--font-normal);
	}

	.notice {
		padding: var(--space-6) var(--space-4);
		text-align: center;
		color: var(--color-text-secondary);
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-lg);
	}

	.notice p {
		margin: 0;
	}

	.retry {
		margin-top: var(--space-3);
		min-height: 40px;
		padding: 0 var(--space-4);
		border: none;
		border-radius: var(--radius-full);
		background: var(--color-primary-700);
		color: #fff;
		cursor: pointer;
	}
</style>
