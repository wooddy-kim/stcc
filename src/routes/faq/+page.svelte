<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import PageWrapper from '$lib/components/layout/PageWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let openIndex: number | null = null;

	function toggleQuestion(index: number) {
		openIndex = openIndex === index ? null : index;
	}

	const faqs = [
		// 서비스 이용 관련
		{
			category: '서비스 이용 관련',
			items: [
				{
					question: 'CourtNow는 무엇인가요?',
					answer:
						'CourtNow는 수도권 공공 테니스장 예약 현황을 실시간으로 확인할 수 있는 서비스입니다. 각 테니스장의 공식 웹사이트에서 예약 정보를 수집하여 한눈에 보기 쉽게 제공하며, 사용자가 원하는 시간대와 코트를 빠르게 찾을 수 있도록 도와드립니다.'
				},
				{
					question: '예약 현황은 얼마나 자주 업데이트되나요?',
					answer:
						'예약 현황은 매 1분마다 자동으로 업데이트됩니다. 각 테니스장의 공식 웹사이트에서 최신 정보를 수집하여 데이터베이스에 저장하므로, 항상 정확하고 신뢰할 수 있는 정보를 제공합니다. 단, 각 테니스장의 시스템 점검이나 네트워크 문제로 인해 일시적으로 업데이트가 지연될 수 있습니다.'
				},
				{
					question: '어떤 테니스장을 지원하나요?',
					answer:
						'현재 CourtNow는 수원시(망포글로벌, 동탄센트럴 등), 동탄시, 용인시(용인시립골드, 남산근린공원 등), 화성시(여울공원, 왕배산체육공원, 금반저류지 등) 총 8개 이상의 공공 테니스장을 지원합니다. 지원 시설은 지속적으로 확대되고 있으며, 새로운 시설 추가 요청은 문의 페이지를 통해 보내주시면 검토하겠습니다.'
				},
				{
					question: '직접 예약도 가능한가요?',
					answer:
						'아니요, CourtNow는 예약 현황을 확인하는 서비스이며 직접 예약 기능은 제공하지 않습니다. 예약 가능한 시간대를 확인한 후, 각 테니스장의 공식 웹사이트나 전화를 통해 직접 예약하셔야 합니다. 각 코트 페이지에서 해당 시설의 예약 링크와 전화번호를 제공하고 있으니 참고해 주세요.'
				},
				{
					question: '모바일에서도 사용할 수 있나요?',
					answer:
						'네, CourtNow는 모바일 친화적인 반응형 디자인으로 제작되어 스마트폰, 태블릿, PC 등 모든 기기에서 최적화된 화면으로 이용하실 수 있습니다. 또한 PWA(Progressive Web App) 기능을 지원하여 앱처럼 설치하고 사용할 수 있습니다.'
				},
				{
					question: '앱 설치는 어떻게 하나요?',
					answer:
						'CourtNow는 PWA(Progressive Web App) 방식으로 앱처럼 설치할 수 있습니다. iOS(iPhone/iPad)는 Safari에서 공유 버튼 → "홈 화면에 추가"를 선택하고, Android는 Chrome에서 메뉴 → "홈 화면에 추가"를 선택하시면 됩니다. 자세한 설치 가이드는 PWA 설치 가이드 페이지를 참고해 주세요.'
				}
			]
		},
		// 기술적 질문
		{
			category: '기술적 질문',
			items: [
				{
					question: '로그인이 필요한가요?',
					answer:
						'아니요, CourtNow는 로그인 없이 모든 기능을 자유롭게 이용하실 수 있습니다. 개인정보 수집을 최소화하기 위해 회원가입이나 로그인 시스템을 제공하지 않으며, 누구나 제약 없이 테니스장 예약 현황을 확인할 수 있습니다.'
				},
				{
					question: '개인정보는 어떻게 보호되나요?',
					answer:
						'CourtNow는 사용자의 개인정보를 수집하지 않습니다. 단, 서비스 개선을 위해 Google Analytics를 통해 익명화된 방문 통계를 수집하며, 모든 데이터는 SSL/TLS 암호화를 통해 안전하게 전송됩니다. 자세한 내용은 개인정보처리방침 페이지를 참고해 주세요.'
				},
				{
					question: '어떤 브라우저를 지원하나요?',
					answer:
						'CourtNow는 Chrome, Safari, Firefox, Edge 등 대부분의 최신 브라우저를 지원합니다. 최적의 사용 경험을 위해 최신 버전의 브라우저를 사용하시는 것을 권장합니다. 구형 브라우저(IE 11 이하)는 지원하지 않습니다.'
				},
				{
					question: '오프라인에서도 사용 가능한가요?',
					answer:
						'PWA로 설치한 경우 일부 기능은 오프라인에서도 사용할 수 있습니다. 하지만 예약 현황 조회는 실시간 데이터를 서버에서 가져오기 때문에 인터넷 연결이 필요합니다. 오프라인 상태에서는 이전에 조회한 페이지의 캐시된 정보만 확인할 수 있습니다.'
				}
			]
		},
		// 예약 관련
		{
			category: '예약 관련',
			items: [
				{
					question: '예약 가능 시간은 어떻게 확인하나요?',
					answer:
						'메인 페이지에서 원하는 지역과 테니스장을 선택하면 해당 시설의 예약 현황을 시간대별로 확인할 수 있습니다. 녹색은 예약 가능, 회색은 예약 완료, 빨간색은 예약 불가 상태를 나타냅니다. 요일을 선택하면 선택한 요일의 모든 시간대를 한눈에 볼 수 있어 편리합니다.'
				},
				{
					question: '여러 요일을 동시에 조회할 수 있나요?',
					answer:
						'네, 가능합니다. 요일 선택 버튼에서 원하는 요일들을 체크하면 여러 요일의 예약 현황을 동시에 비교할 수 있습니다. 예를 들어 "월요일"과 "수요일"을 선택하면 두 요일의 예약 가능 시간대를 동시에 확인하여 최적의 시간을 찾을 수 있습니다.'
				},
				{
					question: '선호하는 코트를 저장할 수 있나요?',
					answer:
						'현재는 즐겨찾기 기능을 제공하지 않지만, PWA로 설치하거나 브라우저 북마크 기능을 활용하면 자주 이용하는 코트 페이지를 빠르게 접근할 수 있습니다. 향후 업데이트에서 즐겨찾기 기능을 추가할 예정입니다.'
				},
				{
					question: '예약 알림 기능이 있나요?',
					answer:
						'현재는 예약 알림 기능을 제공하지 않습니다. 예약 가능 시간대를 발견하면 즉시 해당 테니스장의 공식 웹사이트나 전화를 통해 예약하시는 것을 권장합니다. 예약 알림 기능은 향후 업데이트에서 검토하고 있습니다.'
				}
			]
		},
		// 기타
		{
			category: '기타',
			items: [
				{
					question: '서비스는 무료인가요?',
					answer:
						'네, CourtNow는 완전히 무료로 제공되는 서비스입니다. 테니스를 사랑하는 동호인들이 더 쉽게 예약할 수 있도록 돕기 위해 만들어졌으며, 앞으로도 무료로 운영될 예정입니다. 서비스 운영 비용은 Google AdSense 광고와 Coupang Partners 제휴를 통해 충당하고 있습니다.'
				},
				{
					question: '광고가 표시되는 이유는?',
					answer:
						'CourtNow는 무료 서비스이며, 서비스 운영 비용(서버, 데이터베이스, 도메인 등)을 충당하기 위해 Google AdSense 광고를 게재하고 있습니다. 광고 수익은 전액 서비스 유지 및 개선에 사용되며, 사용자 경험을 해치지 않는 범위 내에서 최소한의 광고만 표시합니다.'
				},
				{
					question: '오류 발생 시 어떻게 하나요?',
					answer:
						'서비스 이용 중 오류가 발생하거나 잘못된 정보를 발견하시면 문의 페이지를 통해 알려주시기 바랍니다. 오류 내용, 발생 시간, 사용 중인 브라우저 및 기기 정보를 함께 보내주시면 빠르게 확인하고 조치하겠습니다. 영업일 기준 24-48시간 이내에 답변드립니다.'
				},
				{
					question: '새로운 테니스장 추가 요청은?',
					answer:
						'새로운 테니스장 추가를 원하시면 문의 페이지를 통해 요청해 주세요. 시설명, 위치, 공식 웹사이트 주소를 함께 알려주시면 검토 후 추가 가능 여부를 안내드리겠습니다. 단, 온라인 예약 시스템이 있고 예약 현황을 공개하는 시설만 추가 가능합니다.'
				}
			]
		}
	];

	let currentCategoryIndex = 0;

	$: currentCategory = faqs[currentCategoryIndex];
	$: totalQuestions = faqs.reduce((sum, cat) => sum + cat.items.length, 0);
</script>

<svelte:head>
	<title>자주 묻는 질문 (FAQ) - CourtNow</title>
	<meta
		name="description"
		content="CourtNow 서비스 이용, 예약 현황 조회, 기술적 질문, 앱 설치 등에 대한 자주 묻는 질문과 답변"
	/>
	<link rel="canonical" href="https://courtnow.info/faq" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="자주 묻는 질문 (FAQ) - CourtNow" />
	<meta property="og:description" content="CourtNow 서비스 이용, 예약 현황 조회, 기술적 질문, 앱 설치 등에 대한 자주 묻는 질문과 답변" />
	<meta property="og:url" content="https://courtnow.info/faq" />
	<meta property="og:site_name" content="CourtNow" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:image" content="https://courtnow.info/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="자주 묻는 질문 (FAQ) - CourtNow" />
	<meta name="twitter:description" content="CourtNow 서비스 이용, 예약 현황 조회, 기술적 질문, 앱 설치 등에 대한 자주 묻는 질문과 답변" />
	<meta name="twitter:image" content="https://courtnow.info/og-image.png" />

	<!-- FAQPage Schema -->
	{@html `<script type="application/ld+json">
	${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.flatMap((category) =>
			category.items.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: item.answer
				}
			}))
		)
	})}
	<\/script>`}

	<!-- Breadcrumb Schema -->
	{@html `<script type="application/ld+json">
	${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: '홈',
				item: 'https://courtnow.info'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: '자주 묻는 질문',
				item: 'https://courtnow.info/faq'
			}
		]
	})}
	<\/script>`}
</svelte:head>

<PageWrapper variant="narrow">
	<PageHeader
		title="자주 묻는 질문 (FAQ)"
		description="CourtNow 서비스 이용에 대한 궁금증을 해결해 드립니다."
		size="md"
		showDecoration
	/>

	<div class="faq-stats">
		<p>총 <strong>{totalQuestions}개</strong>의 질문과 답변이 있습니다.</p>
	</div>

	<div class="category-tabs">
		{#each faqs as category, index}
			<button
				class="category-tab"
				class:active={currentCategoryIndex === index}
				on:click={() => {
					currentCategoryIndex = index;
					openIndex = null;
				}}
			>
				{category.category}
				<span class="count">({category.items.length})</span>
			</button>
		{/each}
	</div>

	<Card padding="lg">
		<h2 class="category-title">{currentCategory.category}</h2>

		<div class="faq-list">
			{#each currentCategory.items as item, index}
				<div class="faq-item">
					<button class="faq-question" on:click={() => toggleQuestion(index)}>
						<span class="question-icon">Q.</span>
						<span class="question-text">{item.question}</span>
						<span class="toggle-icon" class:open={openIndex === index}>
							{openIndex === index ? '−' : '+'}
						</span>
					</button>

					{#if openIndex === index}
						<div class="faq-answer">
							<span class="answer-icon">A.</span>
							<p>{item.answer}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</Card>

	<div class="contact-card-wrapper">
		<Card padding="lg">
			<div class="contact-section">
			<h3>더 궁금한 점이 있으신가요?</h3>
			<p>
				FAQ에서 원하는 답변을 찾지 못하셨다면 문의 페이지를 통해 직접 문의해 주세요.
				24-48시간 이내에 답변드리겠습니다.
			</p>
			<a href="/contact" class="contact-button">문의하기</a>
		</div>
		</Card>
	</div>
</PageWrapper>

<style>
	.faq-stats {
		text-align: center;
		margin-bottom: var(--space-6);
		color: var(--color-text-secondary);
	}

	.faq-stats strong {
		color: var(--color-primary-600);
		font-weight: var(--font-semibold);
	}

	.category-tabs {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
		overflow-x: auto;
		padding-bottom: var(--space-2);
	}

	.category-tab {
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-border-light);
		background: var(--color-bg-primary);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.category-tab:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-primary-400);
	}

	.category-tab.active {
		background: var(--color-primary-600);
		color: white;
		border-color: var(--color-primary-600);
	}

	.category-tab .count {
		font-size: var(--text-xs);
		opacity: 0.8;
	}

	.category-title {
		color: var(--color-text-primary);
		font-size: var(--text-2xl);
		margin-bottom: var(--space-6);
		padding-bottom: var(--space-4);
		border-bottom: 2px solid var(--color-primary-400);
	}

	.faq-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.faq-item {
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-md);
		overflow: hidden;
		transition: all 0.2s;
	}

	.faq-item:hover {
		border-color: var(--color-primary-400);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.faq-question {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-5);
		background: var(--color-bg-primary);
		border: none;
		cursor: pointer;
		text-align: left;
		transition: background 0.2s;
	}

	.faq-question:hover {
		background: var(--color-bg-secondary);
	}

	.question-icon {
		color: var(--color-primary-600);
		font-weight: var(--font-bold);
		font-size: var(--text-lg);
		flex-shrink: 0;
	}

	.question-text {
		flex: 1;
		color: var(--color-text-primary);
		font-weight: var(--font-medium);
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
	}

	.toggle-icon {
		color: var(--color-primary-600);
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: transform 0.2s;
	}

	.toggle-icon.open {
		transform: rotate(180deg);
	}

	.faq-answer {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-5);
		padding-top: var(--space-3);
		background: var(--color-primary-50);
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.answer-icon {
		color: var(--color-success-600);
		font-weight: var(--font-bold);
		font-size: var(--text-lg);
		flex-shrink: 0;
	}

	.faq-answer p {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	.contact-card-wrapper {
		margin-top: var(--space-6);
	}

	.contact-section {
		text-align: center;
	}

	.contact-section h3 {
		color: var(--color-text-primary);
		font-size: var(--text-xl);
		margin-bottom: var(--space-4);
	}

	.contact-section p {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-6);
	}

	.contact-button {
		display: inline-block;
		padding: var(--space-3) var(--space-6);
		background: var(--color-primary-600);
		color: white;
		text-decoration: none;
		border-radius: var(--radius-md);
		font-weight: var(--font-semibold);
		transition: background 0.2s;
	}

	.contact-button:hover {
		background: var(--color-primary-700);
	}

	@media (max-width: 768px) {
		.category-tabs {
			flex-wrap: nowrap;
		}

		.category-tab {
			font-size: var(--text-xs);
			padding: var(--space-2) var(--space-3);
		}

		.question-text {
			font-size: var(--text-sm);
		}

		.faq-answer {
			font-size: var(--text-sm);
		}
	}
</style>
