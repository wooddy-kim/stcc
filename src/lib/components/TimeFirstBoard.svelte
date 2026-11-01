<script lang="ts">
	import { onMount } from 'svelte';
	import { favorites } from '$lib/stores/favorites';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';
	import DayBar from '$lib/components/DayBar.svelte';
	import WeatherPanel from '$lib/components/WeatherPanel.svelte';
	import AdSenseBanner from '$lib/components/ads/AdSenseBanner.svelte';
	import { AD_SLOTS } from '$lib/config/ads';
	import { REGION_COORDINATES } from '$lib/utils/weather';
	import { formatRelativeTime, getMostRecentCrawlTime } from '$lib/utils/timeUtils';
	import {
		CHIP_HOURS,
		MAX_DAYS_AHEAD,
		addDays,
		buildTable,
		dateRange,
		chipCounts,
		defaultSelection,
		isChipPast,
		keepOrResetHour,
		kstNow,
		openSlots,
		regionShortName,
		type TableRow,
		type KstNow,
		type Slot
	} from '$lib/utils/time-first';

	interface CourtEntry {
		id: number;
		name: string;
		slug: string | null;
		regionCode: string | null;
	}
	interface RegionEntry {
		code: string;
		name: string;
	}
	interface Row extends Slot {
		crawledAt: string | null;
	}

	export let courts: CourtEntry[] = [];
	export let regions: RegionEntry[] = [];
	/** 수집된 데이터가 있는 마지막 날짜. 없으면 MAX_DAYS_AHEAD까지. */
	export let lastDay: string | null = null;
	/** ?region= 로 들어오면 그 시를 선택한 채로 연다 (시 단위 페이지·홍보 링크). 대소문자 무시. */
	export let initialRegion: string | null = null;

	const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
	/** 막대(6~22시 16칸)에서 칩 H가 덮는 두 칸 [H, H+2)의 시작 위치(%). 버튼 폭은 두 칸. */
	const axisLeft = (h: number) => ((h - 6) / 16) * 100;
	/** 기상청 단기예보가 닿는 날까지만 날씨 버튼을 보인다 */
	const WEATHER_DAYS = 2;

	let region =
		regions.find((r) => r.code.toLowerCase() === initialRegion?.toLowerCase())?.code ?? 'all';
	let now: KstNow | null = null;
	let date = '';
	let hour: number = CHIP_HOURS[0];
	let rows: Row[] = [];
	let loading = true;
	let failed = false;
	let fetchId = 0;
	let showWeather = false;

	$: regionNames = new Map(regions.map((r) => [r.code, regionShortName(r.name)]));
	$: inService = courts.filter((c) => c.regionCode && regionNames.has(c.regionCode));
	$: visibleCourts =
		region === 'all' ? inService : inService.filter((c) => c.regionCode === region);
	$: slots = now ? openSlots(rows, date, now) : [];
	$: reported = new Set(rows.map((r) => r.courtId).filter((id): id is number => id != null));
	$: table = buildTable(
		visibleCourts,
		slots,
		hour,
		$favorites,
		regions.map((r) => r.code),
		reported
	);
	$: openCount = table.reduce(
		(n, sec) => n + sec.rows.filter((r) => r.status.kind === 'open').length,
		0
	);
	// 지역 탭 하나만 볼 때는 지역 구분 줄이 필요 없다
	$: showRegionHeads = region === 'all';
	$: counts = chipCounts(visibleCourts, slots);
	$: crawledAt = getMostRecentCrawlTime(rows);
	/** 고를 수 있는 날짜: 오늘 ~ 데이터가 있는 마지막 날 */
	$: days = now ? dateRange(now.date, lastDay ?? addDays(now.date, MAX_DAYS_AHEAD)) : [];
	$: weatherRegion = region.toUpperCase();
	$: showWeatherButton =
		region !== 'all' &&
		weatherRegion in REGION_COORDINATES &&
		now !== null &&
		date <= addDays(now.date, WEATHER_DAYS);

	function dayParts(d: string): { weekday: number; day: number; month: number } {
		const [y, m, day] = d.split('-').map(Number);
		return { weekday: new Date(Date.UTC(y, m - 1, day)).getUTCDay(), day, month: m };
	}

	function relativeDay(d: string): string {
		if (!now) return '';
		if (d === now.date) return '오늘';
		if (d === addDays(now.date, 1)) return '내일';
		return '';
	}

	async function load(target: string) {
		const id = ++fetchId;
		loading = true;
		failed = false;
		try {
			const res = await fetch(`/api/reservations?startDate=${target}&endDate=${target}`);
			const json = await res.json();
			if (id !== fetchId) return;
			if (!res.ok || !json.success) throw new Error(json.error ?? res.statusText);
			rows = json.data;
		} catch (err) {
			if (id !== fetchId) return;
			console.error('Failed to fetch reservations:', err);
			rows = [];
			failed = true;
		} finally {
			if (id === fetchId) loading = false;
		}
	}

	function selectDate(next: string) {
		if (!now || next === date) return;
		date = next;
		hour = keepOrResetHour(date, hour, now);
		load(date);
	}

	/** 고른 날짜 버튼이 띠 밖에 있으면 보이게 끌어온다 (기본 선택이 내일일 때 등) */
	function keepInView(node: HTMLElement, selected: boolean) {
		const run = (on: boolean) => on && node.scrollIntoView({ block: 'nearest', inline: 'center' });
		run(selected);
		return { update: run };
	}

	function resetToNow() {
		now = kstNow();
		({ date, hour } = defaultSelection(now));
		load(date);
	}

	onMount(() => {
		resetToNow();
		// 탭을 밤새 열어 두었다가 돌아오면 "오늘"이 어제로 남지 않게 한다.
		const onVisible = () => {
			if (document.visibilityState !== 'visible' || !now) return;
			const fresh = kstNow();
			if (fresh.date !== now.date) resetToNow();
			else now = fresh;
		};
		document.addEventListener('visibilitychange', onVisible);
		return () => document.removeEventListener('visibilitychange', onVisible);
	});
</script>

{#snippet courtRow(row: TableRow<CourtEntry>)}
	<li class="t-row {row.status.kind}">
		<div class="t-fav">
			<FavoriteButton courtId={row.court.id} size="sm" />
		</div>
		<svelte:element
			this={row.court.slug ? 'a' : 'div'}
			href={row.court.slug ? `/courts/${row.court.slug}` : undefined}
			class="t-main"
		>
			<span class="t-name">{row.court.name}</span>
			<DayBar slots={row.slots} selectedHour={hour} showAxis={false} />
		</svelte:element>
		<span class="t-status">
			{#if row.status.kind === 'open'}
				{row.status.faces !== null ? `${row.status.faces}면` : '가능'}
			{:else if row.status.kind === 'closed'}
				마감
			{:else}
				정보 없음
			{/if}
		</span>
	</li>
{/snippet}

<section class="board" aria-labelledby="board-title">
	<h2 id="board-title" class="sr-only">시간별 빈 코트</h2>

	<div class="controls">
		<div class="region-tabs" role="group" aria-label="지역">
			<button
				type="button"
				class="region-tab"
				aria-pressed={region === 'all'}
				on:click={() => (region = 'all')}
			>
				전체<span class="tab-count">{inService.length}</span>
			</button>
			{#each regions as r (r.code)}
				<button
					type="button"
					class="region-tab"
					aria-pressed={region === r.code}
					on:click={() => (region = r.code)}
				>
					{regionShortName(r.name)}<span class="tab-count"
						>{inService.filter((c) => c.regionCode === r.code).length}</span
					>
				</button>
			{/each}
			{#if showWeatherButton}
				<button type="button" class="weather-btn" on:click={() => (showWeather = true)}>
					날씨
				</button>
			{/if}
		</div>

		<div class="date-strip" role="group" aria-label="날짜">
			{#each days as d (d)}
				{@const p = dayParts(d)}
				<button
					type="button"
					class="date-btn"
					class:sun={p.weekday === 0}
					class:sat={p.weekday === 6}
					aria-pressed={d === date}
					aria-label="{p.month}월 {p.day}일 {WEEKDAYS[p.weekday]}요일 {relativeDay(d)}"
					on:click={() => selectDate(d)}
					use:keepInView={d === date}
				>
					<span class="date-wd">{relativeDay(d) || WEEKDAYS[p.weekday]}</span>
					<span class="date-day"
						>{p.day === 1 || d === days[0] ? `${p.month}/${p.day}` : p.day}</span
					>
				</button>
			{/each}
		</div>
	</div>

	{#if loading}
		<div class="court-table" aria-busy="true">
			{#each [1, 2, 3, 4, 5, 6] as i (i)}
				<div class="skeleton"></div>
			{/each}
		</div>
	{:else if failed}
		<div class="notice">
			<p>예약 현황을 불러오지 못했어요</p>
			<button type="button" class="retry" on:click={() => load(date)}>다시 시도</button>
		</div>
	{:else if rows.length === 0}
		<div class="notice"><p>아직 수집된 예약 정보가 없어요</p></div>
	{:else}
		{#if crawledAt}
			<p class="freshness">{formatRelativeTime(crawledAt)}</p>
		{/if}

		<div class="court-table">
			<div class="t-head">
				<span>
					<span class="t-head-date"
						>{dayParts(date).month}.{dayParts(date).day}({WEEKDAYS[dayParts(date).weekday]})</span
					>
					{#if openCount > 0}
						{hour}시에 빈 코트 <em>{openCount}곳</em>
					{:else}
						이 시간엔 빈 코트가 없어요
					{/if}
				</span>
			</div>
			<!-- 시간축 머리줄: 스크롤해도 위에 붙어 있고, 숫자를 눌러 시간을 바로 바꾼다 -->
			<div class="t-axis-row">
				<span class="t-fav-spacer"></span>
				<div class="t-axis" role="group" aria-label="시작 시간">
					{#each CHIP_HOURS as h (h)}
						<button
							type="button"
							class="t-axis-btn"
							style="left: {axisLeft(h)}%"
							aria-pressed={h === hour}
							aria-label="{h}시, 빈 코트 {counts[h]}곳"
							disabled={now !== null && isChipPast(date, h, now)}
							on:click={() => (hour = h)}
						>
							<span class="t-axis-label" class:selected={h === hour}>{h}</span>
							<span class="t-axis-count">{counts[h]}곳</span>
						</button>
					{/each}
				</div>
				<span class="t-status-spacer">{hour}시</span>
			</div>
			{#each table as sec (sec.key)}
				{#if sec.key === 'favorites'}
					<h3 class="t-section">★ 관심 코트</h3>
				{:else if showRegionHeads}
					<h3 class="t-section">{regionNames.get(sec.key)}</h3>
				{/if}
				<ul class="t-rows">
					{#each sec.rows as row (row.court.id)}
						{@render courtRow(row)}
					{/each}
				</ul>
			{/each}
		</div>

		<AdSenseBanner adSlot={AD_SLOTS.home.mid} variant="in-feed" lazyLoad={true} minHeight="100px" />
	{/if}
</section>

{#if showWeather}
	<WeatherPanel region={weatherRegion} on:close={() => (showWeather = false)} />
{/if}

<style>
	.board {
		margin: var(--space-4) 0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-sm);
	}

	.date-strip {
		display: flex;
		gap: var(--space-1);
		overflow-x: auto;
		scrollbar-width: none;
		scroll-snap-type: x proximity;
	}

	.date-strip::-webkit-scrollbar {
		display: none;
	}

	.date-btn {
		flex: none;
		width: 48px;
		min-height: 48px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1px;
		border: none;
		border-radius: var(--radius-lg);
		background: transparent;
		color: var(--color-text-primary);
		cursor: pointer;
		scroll-snap-align: start;
	}

	.date-btn:hover {
		background: var(--color-bg-tertiary);
	}

	.date-wd {
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.date-btn.sun .date-wd {
		color: var(--color-error-600);
	}

	.date-btn.sat .date-wd {
		color: #2563eb;
	}

	.date-day {
		font-size: var(--text-base);
		font-weight: var(--font-bold);
		white-space: nowrap;
	}

	.date-btn[aria-pressed='true'] {
		background: var(--color-primary-700);
		color: #fff;
	}

	.date-btn[aria-pressed='true'] .date-wd {
		color: #fff;
	}

	.t-head-date {
		margin-right: var(--space-2);
		color: var(--color-text-secondary);
	}

	.t-axis-count {
		font-size: 11px;
		line-height: 1;
		color: var(--color-text-secondary);
	}

	.t-axis-btn[aria-pressed='true'] .t-axis-count {
		color: var(--color-primary-700);
		font-weight: var(--font-bold);
	}

	.region-tabs {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.region-tabs::-webkit-scrollbar {
		display: none;
	}

	.region-tab {
		flex: none;
		min-height: 44px;
		padding: 0 var(--space-4);
		border: none;
		border-radius: var(--radius-full);
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		cursor: pointer;
	}

	.region-tab[aria-pressed='true'] {
		background: var(--color-primary-700);
		color: #fff;
	}

	.tab-count {
		margin-left: var(--space-1);
		font-weight: var(--font-normal);
	}

	.weather-btn {
		min-height: 44px;
		padding: 0 var(--space-3);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-full);
		background: var(--color-bg-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.freshness {
		margin: var(--space-3) var(--space-1) 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-align: right;
	}

	/* overflow: hidden을 쓰면 시간축 머리줄의 sticky가 풀리므로 모서리는 자식에서 처리 */
	.court-table {
		margin-top: var(--space-2);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
	}

	.court-table > :first-child {
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
	}

	.t-axis-row {
		position: sticky;
		/* 상단 네비게이션(64px) 바로 아래 */
		top: 64px;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: 0 var(--space-3) 0 var(--space-1);
		background: var(--color-bg-primary);
		border-bottom: 1px solid var(--color-border-default);
	}

	.t-fav-spacer {
		flex: none;
		width: 44px;
	}

	.t-axis {
		position: relative;
		flex: 1;
		height: 52px;
	}

	.t-axis-btn {
		position: absolute;
		top: 0;
		width: 12.5%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
	}

	.t-axis-btn:disabled {
		cursor: default;
		opacity: 0.35;
	}

	.t-axis-btn:not(:disabled):hover .t-axis-label:not(.selected) {
		background: var(--color-bg-tertiary);
	}

	.t-axis-label {
		min-width: 28px;
		padding: 2px 4px;
		border-radius: var(--radius-full);
		text-align: center;
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--color-text-secondary);
	}

	.t-axis-label.selected {
		background: var(--color-primary-700);
		color: #fff;
		animation: label-pulse 1.6s ease-out infinite;
	}

	@keyframes label-pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(4, 120, 87, 0.5);
		}
		70% {
			box-shadow: 0 0 0 8px rgba(4, 120, 87, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(4, 120, 87, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.t-axis-label.selected {
			animation: none;
		}
	}

	.t-status-spacer {
		flex: none;
		min-width: 56px;
		text-align: right;
		font-size: var(--text-sm);
		font-weight: var(--font-bold);
		color: var(--color-primary-700);
	}

	.t-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		background: var(--color-bg-secondary);
		border-bottom: 1px solid var(--color-border-light);
		font-size: var(--text-sm);
		font-weight: var(--font-bold);
	}

	.t-head em {
		font-style: normal;
		color: var(--color-primary-700);
	}

	.t-section {
		margin: 0;
		padding: var(--space-2) var(--space-4);
		background: var(--color-gray-50);
		border-bottom: 1px solid var(--color-border-light);
		font-size: var(--text-sm);
		font-weight: var(--font-bold);
		color: var(--color-text-secondary);
	}

	.t-rows {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.t-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3) var(--space-2) var(--space-1);
		border-bottom: 1px solid var(--color-border-light);
	}

	.t-rows:last-child .t-row:last-child {
		border-bottom: none;
	}

	/* 마감: 왼쪽 빨간 선 + 빨간 "마감" */
	.t-row.closed {
		box-shadow: inset 3px 0 0 var(--color-error-300);
	}

	.t-fav {
		flex: none;
	}

	.t-main {
		flex: 1;
		min-width: 0;
		display: block;
		padding: var(--space-1) 0;
		color: inherit;
		text-decoration: none;
	}

	.t-name {
		display: block;
		margin-bottom: var(--space-1);
		font-weight: var(--font-bold);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.t-status {
		flex: none;
		min-width: 56px;
		text-align: right;
		font-size: var(--text-sm);
		font-weight: var(--font-extrabold);
		color: var(--color-primary-700);
	}

	.t-row.closed .t-status {
		color: var(--color-error-600);
	}

	.t-row.unknown .t-status {
		color: var(--color-text-secondary);
		font-weight: var(--font-normal);
	}

	.skeleton {
		height: 64px;
		border-bottom: 1px solid var(--color-border-light);
		background: linear-gradient(
			90deg,
			var(--color-bg-tertiary) 0%,
			var(--color-bg-secondary) 50%,
			var(--color-bg-tertiary) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.2s infinite linear;
	}

	@keyframes shimmer {
		from {
			background-position: 200% 0;
		}
		to {
			background-position: -200% 0;
		}
	}

	.notice {
		margin-top: var(--space-4);
		padding: var(--space-6) var(--space-4);
		text-align: center;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary);
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-lg);
	}

	.notice p {
		margin: 0;
	}

	.retry {
		margin-top: var(--space-3);
		min-height: 44px;
		padding: 0 var(--space-4);
		border: none;
		border-radius: var(--radius-full);
		background: var(--color-primary-700);
		color: #fff;
		cursor: pointer;
	}
</style>
