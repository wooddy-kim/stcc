<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_KAKAO_MAP_KEY } from '$env/static/public';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';

	export let selectedDate: string = '';

	export let courts: Array<{
		id: number;
		name: string;
		slug: string | null;
		regionName: string | null;
		latitude: number | null;
		longitude: number | null;
		availabilityStatus: 'available' | 'closed' | 'no_data';
		availableSlotCount: number;
	}> = [];

	let mapContainer: HTMLDivElement;
	let map: any = null;
	let kakao: any = null;
	let overlays: any[] = [];
	let myLocationOverlay: any = null;
	let locating = false;
	let locationError = '';
	let mapReady = false;

	// 사이드바/바텀시트 상태
	let userLat: number | null = null;
	let userLon: number | null = null;
	let sheetExpanded = false;
	let activeCourt: number | null = null;

	const STATUS_COLORS = {
		available: '#16a34a',
		closed: '#dc2626',
		no_data: '#6b7280'
	} as const;

	const STATUS_LABELS = {
		available: '예약 가능',
		closed: '마감',
		no_data: '정보 없음'
	} as const;

	const STATUS_BG = {
		available: '#f0fdf4',
		closed: '#fef2f2',
		no_data: '#f9fafb'
	} as const;

	// 거리 계산 (Haversine)
	function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const R = 6371;
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) ** 2;
		return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
	}

	// 거리순 정렬 코트 목록
	$: sortedCourts = courts
		.filter((c) => c.latitude != null && c.longitude != null)
		.map((c) => ({
			...c,
			distance:
				userLat != null && userLon != null
					? calcDistance(userLat, userLon, c.latitude!, c.longitude!)
					: null
		}))
		.sort((a, b) => {
			if (a.distance == null && b.distance == null) return 0;
			if (a.distance == null) return 1;
			if (b.distance == null) return -1;
			return a.distance - b.distance;
		});

	// courts prop 변경 시 마커 리렌더링
	$: if (mapReady && courts) {
		renderMarkers(courts);
	}

	function createMarkerHTML(court: (typeof courts)[0]) {
		const color = STATUS_COLORS[court.availabilityStatus];
		const escapedName = court.name
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
		return `
			<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;">
				<div style="background:${color};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">🎾</div>
				<div style="background:${color};color:white;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;margin-top:2px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);max-width:120px;overflow:hidden;text-overflow:ellipsis;">${escapedName}</div>
			</div>`;
	}

	function createMyLocationHTML() {
		return `<div style="user-select:none;"><div style="background:#2563eb;border-radius:50%;width:18px;height:18px;border:3px solid white;box-shadow:0 0 0 3px rgba(37,99,235,0.3),0 2px 6px rgba(0,0,0,0.3);"></div></div>`;
	}

	function createInfoWindowEl(court: (typeof courts)[0], onClose: () => void) {
		const statusLabel = STATUS_LABELS[court.availabilityStatus];
		const statusColor = STATUS_COLORS[court.availabilityStatus];
		const slotText =
			court.availabilityStatus === 'available'
				? `✅ 오늘 ${court.availableSlotCount}개 슬롯 가능`
				: court.availabilityStatus === 'closed'
					? '❌ 오늘 예약 마감'
					: '⚫ 오늘 정보 없음';

		const wrap = document.createElement('div');
		wrap.style.cssText = 'pointer-events:auto;';
		wrap.innerHTML = `
			<div style="background:white;border-radius:10px;padding:14px 16px;min-width:190px;box-shadow:0 4px 16px rgba(0,0,0,0.15);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;">
				<button class="iw-close" style="position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;color:#9ca3af;font-size:16px;line-height:1;padding:0;">✕</button>
				<div style="font-weight:700;font-size:14px;color:#111827;margin-bottom:4px;padding-right:20px;">${court.name}</div>
				<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">📍 ${court.regionName ?? ''}</div>
				<div style="display:inline-block;background:${statusColor}20;color:${statusColor};padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;margin-bottom:8px;">${statusLabel}</div>
				<div style="font-size:13px;color:#374151;margin-bottom:12px;">${slotText}</div>
				<button class="iw-link" style="display:block;width:100%;background:#10b981;color:white;text-align:center;padding:8px 12px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:600;">예약 현황 보기 →</button>
			</div>
			<div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid white;margin:0 auto;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.1));"></div>`;

		// 이벤트 위임: 버블링 방지 + 클릭 대상 판별
		wrap.addEventListener('click', (e) => {
			e.stopPropagation();
			const target = e.target as HTMLElement;
			if (target.closest('.iw-close')) {
				onClose();
			} else if (target.closest('.iw-link')) {
				const dest = court.slug
					? `/courts/${court.slug}${selectedDate ? `?date=${selectedDate}` : ''}`
					: '/';
				window.location.assign(dest);
			}
		});

		return wrap;
	}

	function showInfoWindow(court: (typeof courts)[0], position: any) {
		(window as any).__closeMapInfoWindow?.();

		let overlay: any;
		const content = createInfoWindowEl(court, () => {
			overlay?.setMap(null);
			activeCourt = null;
		});

		overlay = new kakao.maps.CustomOverlay({
			position,
			content,
			clickable: true, // 지도 클릭 이벤트 차단, 오버레이 자체 이벤트 허용
			yAnchor: 1.35,
			zIndex: 10
		});
		overlay.setMap(map);
		activeCourt = court.id;
		(window as any).__closeMapInfoWindow = () => {
			overlay.setMap(null);
			activeCourt = null;
		};
	}

	function focusCourt(court: (typeof courts)[0] & { distance: number | null }) {
		if (!map || court.latitude == null || court.longitude == null) return;
		const pos = new kakao.maps.LatLng(court.latitude, court.longitude);
		map.setCenter(pos);
		map.setLevel(6);
		showInfoWindow(court, pos);
		sheetExpanded = false;
	}

	function renderMarkers(courtList: typeof courts) {
		for (const ov of overlays) ov.setMap(null);
		overlays = [];
		(window as any).__closeMapInfoWindow?.();

		for (const court of courtList) {
			if (court.latitude == null || court.longitude == null) continue;
			const position = new kakao.maps.LatLng(court.latitude, court.longitude);
			const content = document.createElement('div');
			content.innerHTML = createMarkerHTML(court);
			content.style.cssText = 'pointer-events:auto;';
			content.addEventListener('click', (e) => {
				e.stopPropagation();
				showInfoWindow(court, position);
			});

			const overlay = new kakao.maps.CustomOverlay({
				position,
				content,
				clickable: true,
				yAnchor: 1,
				zIndex: 5
			});
			overlay.setMap(map);
			overlays.push(overlay);
		}
	}

	function initMap() {
		const center = new kakao.maps.LatLng(37.21, 127.08);
		map = new kakao.maps.Map(mapContainer, { center, level: 9 });

		const zoomControl = new kakao.maps.ZoomControl();
		map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

		kakao.maps.event.addListener(map, 'click', () => {
			(window as any).__closeMapInfoWindow?.();
		});

		mapReady = true;
		renderMarkers(courts);
	}

	function moveToMyLocation(silent = false) {
		if (!navigator.geolocation) {
			if (!silent) locationError = '이 브라우저는 위치 서비스를 지원하지 않습니다.';
			return;
		}

		locating = true;
		locationError = '';

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				locating = false;
				userLat = pos.coords.latitude;
				userLon = pos.coords.longitude;

				const myPos = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
				if (myLocationOverlay) myLocationOverlay.setMap(null);

				const content = document.createElement('div');
				content.innerHTML = createMyLocationHTML();
				myLocationOverlay = new kakao.maps.CustomOverlay({
					position: myPos,
					content,
					yAnchor: 0.5,
					zIndex: 20
				});
				myLocationOverlay.setMap(map);
				map.setCenter(myPos);
				map.setLevel(8);
			},
			(err) => {
				locating = false;
				if (!silent) {
					locationError = err.code === 1 ? '위치 권한이 거부되었습니다.' : '위치를 가져올 수 없습니다.';
					setTimeout(() => (locationError = ''), 3000);
				}
			},
			{ timeout: 10000, maximumAge: 60000 }
		);
	}

	function loadKakaoSDK(): Promise<void> {
		return new Promise((resolve, reject) => {
			if ((window as any).kakao?.maps) { resolve(); return; }
			const script = document.createElement('script');
			script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
			script.onload = () => (window as any).kakao.maps.load(() => resolve());
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	onMount(async () => {
		try {
			await loadKakaoSDK();
			kakao = (window as any).kakao;
			initMap();
			moveToMyLocation(true);
		} catch (e) {
			console.error('카카오맵 로드 실패:', e);
		}
	});

	onDestroy(() => {
		if (!browser) return;
		for (const ov of overlays) ov.setMap(null);
		myLocationOverlay?.setMap(null);
		(window as any).__closeMapInfoWindow?.();
	});
</script>

<div class="map-wrap">
	<!-- 데스크톱 사이드바 -->
	<div class="sidebar">
		<div class="sidebar-header">
			<span class="sidebar-title">코트 목록</span>
			{#if userLat != null}
				<span class="sidebar-sub">현재 위치 기준</span>
			{:else}
				<span class="sidebar-sub">위치 측정 전</span>
			{/if}
		</div>
		<ul class="court-list">
			{#each sortedCourts as court}
				{@const color = STATUS_COLORS[court.availabilityStatus]}
				{@const bg = STATUS_BG[court.availabilityStatus]}
				<li class="court-row">
					<button
						class="court-item"
						class:active={activeCourt === court.id}
						style="--bg:{bg}"
						on:click={() => focusCourt(court)}
						type="button"
					>
						<span class="status-dot" style="background:{color}"></span>
						<div class="court-info">
							<span class="court-name">{court.name}</span>
							<span class="court-region">{court.regionName ?? ''}</span>
						</div>
						<div class="court-right">
							{#if court.availabilityStatus === 'available'}
								<span class="slot-badge" style="color:{color}">{court.availableSlotCount}슬롯</span>
							{:else}
								<span class="slot-badge" style="color:{color}">{STATUS_LABELS[court.availabilityStatus]}</span>
							{/if}
							{#if court.distance != null}
								<span class="distance">{court.distance}km</span>
							{/if}
						</div>
					</button>
					<FavoriteButton courtId={court.id} size="sm" />
				</li>
			{/each}
		</ul>
	</div>

	<!-- 지도 영역 -->
	<div class="map-area">
		<div bind:this={mapContainer} class="map-container"></div>

		<button
			class="location-btn"
			class:locating
			on:click={() => moveToMyLocation(false)}
			disabled={locating}
			title="내 위치로 이동"
		>
			{#if locating}
				<svg class="spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="3"></circle>
					<path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>
				</svg>
			{/if}
			<span>{locating ? '위치 찾는 중...' : '내 위치'}</span>
		</button>

		{#if locationError}
			<div class="location-error">{locationError}</div>
		{/if}

		<!-- 모바일 바텀시트 -->
		<div class="bottom-sheet" class:expanded={sheetExpanded}>
			<button class="sheet-handle-btn" on:click={() => (sheetExpanded = !sheetExpanded)}>
				<div class="sheet-handle"></div>
				<span class="sheet-title">
					코트 목록 ({sortedCourts.length})
					{#if userLat != null}<span class="sheet-sub"> · 가까운 순</span>{/if}
				</span>
				<svg
					class="sheet-chevron"
					class:up={sheetExpanded}
					xmlns="http://www.w3.org/2000/svg" width="16" height="16"
					viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
					stroke-linecap="round" stroke-linejoin="round"
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</button>
			<div class="sheet-content">
				<ul class="court-list mobile">
					{#each sortedCourts as court}
						{@const color = STATUS_COLORS[court.availabilityStatus]}
						<li class="court-row">
							<button
								class="court-item"
								class:active={activeCourt === court.id}
								on:click={() => focusCourt(court)}
								type="button"
							>
								<span class="status-dot" style="background:{color}"></span>
								<div class="court-info">
									<span class="court-name">{court.name}</span>
									<span class="court-region">{court.regionName ?? ''}</span>
								</div>
								<div class="court-right">
									{#if court.availabilityStatus === 'available'}
										<span class="slot-badge" style="color:{color}">{court.availableSlotCount}슬롯</span>
									{:else}
										<span class="slot-badge" style="color:{color}">{STATUS_LABELS[court.availabilityStatus]}</span>
									{/if}
									{#if court.distance != null}
										<span class="distance">{court.distance}km</span>
									{/if}
								</div>
							</button>
							<FavoriteButton courtId={court.id} size="sm" />
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>

<style>
	.map-wrap {
		display: flex;
		width: 100%;
		height: 100%;
	}

	/* ── 데스크톱 사이드바 ── */
	.sidebar {
		width: 280px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		border-right: 1px solid #e5e7eb;
		background: white;
		overflow: hidden;
	}

	.sidebar-header {
		padding: 12px 16px 10px;
		border-bottom: 1px solid #f3f4f6;
		display: flex;
		align-items: baseline;
		gap: 6px;
		flex-shrink: 0;
	}
	.sidebar-title {
		font-size: 14px;
		font-weight: 700;
		color: #111827;
	}
	.sidebar-sub {
		font-size: 11px;
		color: #9ca3af;
	}

	.court-list {
		list-style: none;
		margin: 0;
		padding: 4px 0;
		overflow-y: auto;
		flex: 1;
	}
	.court-list.mobile {
		overflow-y: auto;
		max-height: 100%;
	}

	.court-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 16px;
		cursor: pointer;
		transition: background 0.15s;
		border-radius: 0;
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		font: inherit;
	}
	.court-item:hover {
		background: #f9fafb;
	}
	.court-item.active {
		background: #f0fdf4;
		border-left: 3px solid #10b981;
		padding-left: 13px;
	}

	.court-row {
		display: flex;
		align-items: center;
	}
	.court-row .court-item {
		flex: 1;
		min-width: 0;
	}
	.court-row :global(.fav-btn) {
		flex-shrink: 0;
		margin-right: 6px;
	}

	.status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.court-info {
		flex: 1;
		min-width: 0;
	}
	.court-name {
		display: block;
		font-size: 13px;
		font-weight: 600;
		color: #111827;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.court-region {
		display: block;
		font-size: 11px;
		color: #9ca3af;
		margin-top: 1px;
	}

	.court-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
		flex-shrink: 0;
	}
	.slot-badge {
		font-size: 11px;
		font-weight: 600;
	}
	.distance {
		font-size: 11px;
		color: #6b7280;
	}

	/* ── 지도 영역 ── */
	.map-area {
		flex: 1;
		position: relative;
		min-width: 0;
	}

	.map-container {
		width: 100%;
		height: 100%;
		min-height: 500px;
	}

	.location-btn {
		position: absolute;
		bottom: 24px;
		right: 12px;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 6px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 8px 14px;
		font-size: 13px;
		font-weight: 600;
		color: #1f2937;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		transition: all 0.2s;
	}
	.location-btn:hover:not(:disabled) {
		background: #f0fdf4;
		border-color: #10b981;
		color: #10b981;
	}
	.location-btn:disabled { cursor: not-allowed; opacity: 0.7; }
	.location-btn.locating { color: #10b981; border-color: #10b981; }

	.spin { animation: spin 1s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }

	.location-error {
		position: absolute;
		bottom: 70px;
		right: 12px;
		z-index: 10;
		background: #fee2e2;
		color: #dc2626;
		border: 1px solid #fca5a5;
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 12px;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	/* ── 모바일 바텀시트 ── */
	.bottom-sheet {
		display: none;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 20;
		background: white;
		border-radius: 16px 16px 0 0;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12);
		height: 56px;
		transition: height 0.3s ease;
		overflow: hidden;
	}
	.bottom-sheet.expanded {
		height: 55vh;
	}

	.sheet-handle-btn {
		width: 100%;
		background: none;
		border: none;
		padding: 10px 16px 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 8px;
		height: 56px;
		flex-shrink: 0;
	}
	.sheet-handle {
		width: 36px;
		height: 4px;
		background: #d1d5db;
		border-radius: 2px;
		flex-shrink: 0;
	}
	.sheet-title {
		flex: 1;
		font-size: 13px;
		font-weight: 600;
		color: #374151;
		text-align: left;
	}
	.sheet-sub {
		font-weight: 400;
		color: #9ca3af;
	}
	.sheet-chevron {
		transition: transform 0.3s;
		flex-shrink: 0;
	}
	.sheet-chevron.up {
		transform: rotate(180deg);
	}

	.sheet-content {
		height: calc(55vh - 56px);
		overflow-y: auto;
	}

	/* ── 반응형 ── */
	@media (max-width: 768px) {
		.sidebar { display: none; }
		.bottom-sheet { display: flex; flex-direction: column; }
		.location-btn { bottom: 72px; }
	}
</style>
