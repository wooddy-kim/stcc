<script lang="ts">
	interface CourtLink {
		id: number;
		name: string;
		slug: string | null;
		regionName: string | null;
		regionCode?: string | null;
	}

	/**
	 * 코트 상세 페이지로 가는 SSR anchor 목록.
	 *
	 * 홈은 사이트에서 권위가 가장 높은 페이지인데 기존에는 코트 상세로 가는
	 * anchor가 하나도 없어 31개 페이지가 사이트맵 외 경로로는 발견되지 않았다.
	 * JSON-LD ItemList에 URL이 있으나 anchor가 아니라 링크 권위 전달이 약하다.
	 */
	export let courts: CourtLink[] = [];

	$: linkable = courts.filter((c) => c.slug);
	// 시 단위 페이지(/regions/[code])로 가는 anchor. 코트 목록에서 뽑아 지역이 늘어도 자동 반영된다.
	$: regionLinks = [
		...new Map(
			linkable
				.filter((c) => c.regionCode && c.regionName)
				.map((c) => [(c.regionCode as string).toLowerCase(), c.regionName as string])
		)
	];
</script>

{#if linkable.length > 0}
	<section class="court-index" aria-labelledby="court-index-title">
		<h2 id="court-index-title" class="court-index-title">수도권 공공 테니스장 전체 목록</h2>
		<p class="court-index-sub">코트별 운영 방침·요금·주차·교통 정보를 확인하세요</p>
		{#if regionLinks.length > 0}
			<ul class="court-index-regions" aria-label="지역별 테니스장">
				{#each regionLinks as [code, name] (code)}
					<li><a href="/regions/{code}">{name} 테니스장</a></li>
				{/each}
			</ul>
		{/if}
		<ul class="court-index-list">
			{#each linkable as court (court.id)}
				<li>
					<a href="/courts/{court.slug}" class="court-index-link">
						<span class="court-index-name">{court.name}</span>
						{#if court.regionName}
							<span class="court-index-region">{court.regionName}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.court-index {
		margin: var(--space-6, 1.5rem) 0;
		padding: var(--space-4, 1rem);
		background: var(--color-bg-secondary, #f9fafb);
		border: 1px solid var(--color-border-light, #e5e7eb);
		border-radius: var(--radius-md, 8px);
	}

	.court-index-title {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary, #111827);
	}

	.court-index-sub {
		margin: 0.25rem 0 var(--space-3, 0.75rem);
		font-size: 0.75rem;
		color: var(--color-text-tertiary, #9ca3af);
	}

	.court-index-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.375rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.court-index-link {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
		padding: 0.4375rem 0.625rem;
		background: #ffffff;
		border: 1px solid var(--color-border-light, #e5e7eb);
		border-radius: var(--radius-sm, 4px);
		text-decoration: none;
		font-size: 0.8125rem;
		color: var(--color-text-primary, #111827);
		transition: border-color 0.15s ease;
	}

	.court-index-link:hover {
		border-color: var(--color-primary-400, #34d399);
	}

	.court-index-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.court-index-region {
		flex-shrink: 0;
		font-size: 0.6875rem;
		color: var(--color-text-tertiary, #9ca3af);
	}

	.court-index-regions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin: 0 0 var(--space-3, 0.75rem);
		padding: 0;
		list-style: none;
	}

	.court-index-regions a {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border: 1px solid var(--color-border-light, #e5e7eb);
		border-radius: 999px;
		background: #ffffff;
		font-size: 0.75rem;
		color: var(--color-text-primary, #111827);
		text-decoration: none;
	}

	@media (max-width: 480px) {
		.court-index-list {
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		}
	}
</style>
