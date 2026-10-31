<script lang="ts">
	import {
		BAR_HOURS,
		barBlocks,
		formatFreeRanges,
		freeHours,
		type Slot
	} from '$lib/utils/time-first';

	/** 예약 가능하고 아직 시작하지 않은 슬롯 (openSlots를 거친 것) */
	export let slots: Slot[] = [];
	/** 선택한 칩의 시작 시각. H~H+2 두 칸에 테두리를 그린다. */
	export let selectedHour: number | null = null;
	/** 축 라벨. 표처럼 머리줄에 시간축이 따로 있으면 끈다. */
	export let showAxis = true;

	const AXIS = [6, 12, 18, 22];
	/** 390px 폭에서 한 시간 칸(약 15px)에 12px 영숫자가 들어가는 수 */
	const MOBILE_CHARS_PER_HOUR = 2;
	/** 한글은 영숫자 두 글자 폭으로 센다 ("장애인" 같은 면 이름) */
	const textWidth = (text: string) => [...text].reduce((w, ch) => w + (ch > '\u3000' ? 2 : 1), 0);
	const first = BAR_HOURS[0];

	$: blocks = barBlocks(slots);
</script>

<div class="day-bar" role="img" aria-label={formatFreeRanges(freeHours(slots))}>
	<div class="cells">
		{#each BAR_HOURS as h, i (h)}
			<span class="cell" style="grid-column: {i + 1}"></span>
		{/each}
		{#each blocks as b (b.col)}
			{@const label = b.names.join('·')}
			<!-- 면 이름(1·2, B·C)을 그대로 보여 주고, 좁은 화면에서 칸에 안 들어가면 "N면"으로 줄인다 -->
			<span
				class="block"
				class:fits={textWidth(label) <= b.span * MOBILE_CHARS_PER_HOUR}
				style="grid-column: {b.col} / span {b.span}"
			>
				<span class="faces">{b.faces !== null ? `${b.faces}면` : ''}</span>
				<span class="names">{label}</span>
			</span>
		{/each}
		{#if selectedHour !== null}
			<span class="selected" style="grid-column: {selectedHour - first + 1} / span 2"></span>
		{/if}
	</div>
	{#if showAxis}
		<div class="axis" aria-hidden="true">
			{#each AXIS as h (h)}
				<span style="left: {((h - 6) / 16) * 100}%">{h}시</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.day-bar {
		width: 100%;
	}

	.cells {
		/* 블록·선택 테두리의 z-index가 막대 밖(표의 고정 시간축)으로 새지 않게 가둔다 */
		isolation: isolate;
		display: grid;
		grid-template-columns: repeat(16, 1fr);
		grid-template-rows: 22px;
		gap: 2px;
	}

	.cell,
	.block,
	.selected {
		grid-row: 1;
		border-radius: 3px;
	}

	.cell {
		background: var(--color-gray-200);
	}

	.block {
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		overflow: hidden;
		background: var(--color-primary-200);
		color: var(--color-primary-900);
		font-size: 12px;
		font-weight: var(--font-bold);
		line-height: 1;
		white-space: nowrap;
	}

	.block .names,
	.block .faces {
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 2px;
	}

	.block .names,
	.block.fits .faces {
		display: none;
	}

	.block.fits .names {
		display: block;
	}

	@media (min-width: 768px) {
		.block .faces {
			display: none;
		}

		.block .names {
			display: block;
		}
	}

	.selected {
		z-index: 2;
		pointer-events: none;
		box-shadow: 0 0 0 1.5px var(--color-gray-800);
		animation: cell-pulse 1.6s ease-out infinite;
	}

	/* 선택한 시간을 눈에 띄게: 테두리 밖으로 번지는 링 */
	@keyframes cell-pulse {
		0% {
			box-shadow:
				0 0 0 1.5px var(--color-gray-800),
				0 0 0 0 rgba(16, 185, 129, 0.55);
		}
		70% {
			box-shadow:
				0 0 0 1.5px var(--color-gray-800),
				0 0 0 5px rgba(16, 185, 129, 0);
		}
		100% {
			box-shadow:
				0 0 0 1.5px var(--color-gray-800),
				0 0 0 0 rgba(16, 185, 129, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.selected {
			animation: none;
		}
	}

	.axis {
		position: relative;
		height: 14px;
		margin-top: 2px;
		/* 보조 눈금. 같은 정보가 aria-label과 블록에 있다 */
		font-size: 11px;
		color: var(--color-text-tertiary);
	}

	.axis span {
		position: absolute;
		transform: translateX(-50%);
		line-height: 14px;
		white-space: nowrap;
	}

	.axis span:first-child {
		transform: none;
	}

	.axis span:last-child {
		transform: translateX(-100%);
	}
</style>
