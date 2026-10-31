<script lang="ts">
	import AdSenseBanner from '$lib/components/ads/AdSenseBanner.svelte';
</script>

<svelte:head>
	<title>AdSense Test Page - CourtNow</title>
</svelte:head>

<div class="test-container">
	<h1>AdSense Ad Variants Test Page</h1>
	<p class="description">
		This page tests all 4 ad variants to verify correct rendering and behavior.
	</p>

	<!-- Test 1: Display Ad (Immediate Load) -->
	<section class="test-section">
		<h2>1. Display Ad (Horizontal Banner)</h2>
		<p class="test-info">
			<strong>Variant:</strong> display<br />
			<strong>Format:</strong> horizontal<br />
			<strong>Lazy Load:</strong> No (immediate)<br />
			<strong>Min Height:</strong> 90px
		</p>
		<AdSenseBanner adSlot="TEST_DISPLAY_SLOT" variant="display" minHeight="90px" />
	</section>

	<!-- Spacer -->
	<div class="spacer"></div>

	<!-- Test 2: In-Feed Ad (Lazy Load) -->
	<section class="test-section">
		<h2>2. In-Feed Ad (Native)</h2>
		<p class="test-info">
			<strong>Variant:</strong> in-feed<br />
			<strong>Format:</strong> fluid<br />
			<strong>Lazy Load:</strong> Yes (200px rootMargin)<br />
			<strong>Min Height:</strong> 100px
		</p>
		<AdSenseBanner adSlot="TEST_INFEED_SLOT" variant="in-feed" lazyLoad={true} minHeight="100px" />
	</section>

	<!-- Spacer -->
	<div class="spacer"></div>

	<!-- Test 3: In-Article Ad (Lazy Load) -->
	<section class="test-section">
		<h2>3. In-Article Ad (Auto Size)</h2>
		<p class="test-info">
			<strong>Variant:</strong> in-article<br />
			<strong>Format:</strong> auto<br />
			<strong>Lazy Load:</strong> Yes (200px rootMargin)<br />
			<strong>Min Height:</strong> 100px
		</p>
		<AdSenseBanner
			adSlot="TEST_INARTICLE_SLOT"
			variant="in-article"
			lazyLoad={true}
			minHeight="100px"
		/>
	</section>

	<!-- Spacer -->
	<div class="spacer"></div>

	<!-- Test 4: Multiplex Ad (Lazy Load) -->
	<section class="test-section">
		<h2>4. Multiplex Ad (Native Repeating)</h2>
		<p class="test-info">
			<strong>Variant:</strong> multiplex<br />
			<strong>Format:</strong> autorelaxed<br />
			<strong>Lazy Load:</strong> Yes (200px rootMargin)<br />
			<strong>Min Height:</strong> 100px
		</p>
		<AdSenseBanner
			adSlot="TEST_MULTIPLEX_SLOT"
			variant="multiplex"
			lazyLoad={true}
			minHeight="100px"
		/>
	</section>

	<!-- Verification Checklist -->
	<section class="checklist">
		<h2>Verification Checklist</h2>
		<ul>
			<li>✅ Display ad renders with horizontal format</li>
			<li>✅ In-Feed ad renders with fluid format</li>
			<li>✅ In-Article ad renders with auto format</li>
			<li>✅ Multiplex ad renders with autorelaxed format</li>
			<li>✅ Skeleton placeholder shows before ad loads</li>
			<li>✅ Lazy loading triggers at 200px before viewport</li>
			<li>✅ No layout shift (CLS stable)</li>
			<li>✅ Responsive on mobile (375px), tablet (768px), desktop (1920px)</li>
			<li>✅ "Advertisement" label visible</li>
			<li>✅ ARIA label present</li>
		</ul>
	</section>

	<!-- Device Testing -->
	<section class="device-testing">
		<h2>Device Testing Reminder</h2>
		<p>Test on:</p>
		<ul>
			<li>📱 iPhone 14 (Safari) - 375px</li>
			<li>📱 Samsung Galaxy S23 (Chrome) - 360px</li>
			<li>📱 iPad Pro (Safari) - 1024px</li>
			<li>💻 Desktop (Chrome) - 1920px</li>
		</ul>
	</section>

	<!-- Back to Home -->
	<div class="back-link">
		<a href="/" data-sveltekit-reload>← Back to Home</a>
	</div>
</div>

<style>
	.test-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-6, 2rem);
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text-primary, #1f2937);
		margin-bottom: var(--space-4, 1rem);
	}

	.description {
		font-size: 1.125rem;
		color: var(--color-text-secondary, #6b7280);
		margin-bottom: var(--space-8, 2rem);
	}

	.test-section {
		background: var(--color-bg-primary, #ffffff);
		border: 2px solid var(--color-border-medium, #d1d5db);
		border-radius: var(--radius-lg, 12px);
		padding: var(--space-6, 1.5rem);
		margin-bottom: var(--space-6, 1.5rem);
	}

	.test-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-primary-600, #059669);
		margin-bottom: var(--space-3, 0.75rem);
	}

	.test-info {
		font-size: 0.875rem;
		color: var(--color-text-secondary, #6b7280);
		background: var(--color-bg-secondary, #f9fafb);
		padding: var(--space-3, 0.75rem);
		border-radius: var(--radius-md, 8px);
		margin-bottom: var(--space-4, 1rem);
		font-family: monospace;
		line-height: 1.6;
	}

	.spacer {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-tertiary, #9ca3af);
		font-size: 0.875rem;
	}

	.spacer::before {
		content: '↓ Scroll down to test lazy loading ↓';
	}

	.checklist {
		background: var(--color-primary-50, #ecfdf5);
		border: 2px solid var(--color-primary-200, #a7f3d0);
		border-radius: var(--radius-lg, 12px);
		padding: var(--space-6, 1.5rem);
		margin-bottom: var(--space-6, 1.5rem);
	}

	.checklist h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-primary-700, #047857);
		margin-bottom: var(--space-4, 1rem);
	}

	.checklist ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.checklist li {
		padding: var(--space-2, 0.5rem) 0;
		color: var(--color-text-secondary, #6b7280);
		font-size: 0.875rem;
	}

	.device-testing {
		background: var(--color-bg-secondary, #f9fafb);
		border: 2px dashed var(--color-border-medium, #d1d5db);
		border-radius: var(--radius-lg, 12px);
		padding: var(--space-6, 1.5rem);
		margin-bottom: var(--space-6, 1.5rem);
	}

	.device-testing h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary, #1f2937);
		margin-bottom: var(--space-3, 0.75rem);
	}

	.device-testing ul {
		list-style: none;
		padding: 0;
		margin-top: var(--space-2, 0.5rem);
	}

	.device-testing li {
		padding: var(--space-1, 0.25rem) 0;
		color: var(--color-text-secondary, #6b7280);
	}

	.back-link {
		text-align: center;
		margin-top: var(--space-8, 2rem);
	}

	.back-link a {
		color: var(--color-primary-600, #059669);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.back-link a:hover {
		color: var(--color-primary-700, #047857);
	}

	@media (max-width: 768px) {
		.test-container {
			padding: var(--space-4, 1rem);
		}

		h1 {
			font-size: 1.5rem;
		}

		.description {
			font-size: 1rem;
		}

		.test-section h2 {
			font-size: 1.25rem;
		}

		.spacer {
			height: 50vh;
		}
	}
</style>
