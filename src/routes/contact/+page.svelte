<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import PageWrapper from '$lib/components/layout/PageWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
</script>

<svelte:head>
	<title>문의하기 - CourtNow</title>
	<meta
		name="description"
		content="CourtNow 서비스 이용 문의, 버그 리포트, 기능 제안, 제휴 문의 안내. 24-48시간 이내 답변."
	/>
	<link rel="canonical" href="https://courtnow.info/contact" />

	<!-- Breadcrumb Schema -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": "홈",
					"item": "https://courtnow.info"
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": "문의하기",
					"item": "https://courtnow.info/contact"
				}
			]
		}
	</script>
</svelte:head>

<PageWrapper variant="narrow">
	<PageHeader
		title="문의하기"
		description="서비스 이용 관련 문의는 아래 이메일로 연락주시기 바랍니다."
		size="md"
		showDecoration
	/>

	<Card padding="lg">
		<section>
			<h2>문의 방법</h2>
			<div class="contact-info">
				<div class="info-item">
					<h3>이메일</h3>
					<p class="email-primary">wodn4131@gmail.com</p>
				</div>


				<div class="info-item">
					<h3>응답 시간</h3>
					<p><strong>24-48시간 이내</strong> 답변</p>
					<p class="note">긴급한 문의는 제목에 [긴급]을 표기해 주세요.</p>
				</div>
			</div>
		</section>

		<section>
			<h2>문의 유형별 가이드</h2>
			<div class="inquiry-types">
				<div class="type-card">
					<div class="type-header">
						<span class="type-icon">💬</span>
						<h3>서비스 이용 문의</h3>
					</div>
					<p>
						서비스 사용법, 예약 현황 조회 방법, PWA 설치 등 일반적인 질문은 먼저 <a
							href="/faq">FAQ 페이지</a
						>를 확인해 주세요. 대부분의 질문에 대한 답변이 준비되어 있습니다.
					</p>
					<ul>
						<li>서비스 이용 방법</li>
						<li>기능 설명 및 사용법</li>
						<li>앱 설치 가이드</li>
					</ul>
				</div>

				<div class="type-card">
					<div class="type-header">
						<span class="type-icon">🐛</span>
						<h3>버그 리포트</h3>
					</div>
					<p>오류 발견 시 아래 정보를 함께 보내주시면 빠르게 해결할 수 있습니다:</p>
					<ul>
						<li>오류 발생 페이지 URL</li>
						<li>오류 발생 시간</li>
						<li>사용 브라우저 및 버전 (예: Chrome 120)</li>
						<li>사용 기기 (예: iPhone 14, Galaxy S23)</li>
						<li>오류 재현 단계 (상세히 작성)</li>
						<li>스크린샷 (가능한 경우)</li>
					</ul>
				</div>

				<div class="type-card">
					<div class="type-header">
						<span class="type-icon">💡</span>
						<h3>기능 제안</h3>
					</div>
					<p>
						새로운 기능이나 개선 아이디어가 있으시면 언제든지 제안해 주세요. 모든 의견을
						소중하게 검토합니다.
					</p>
					<ul>
						<li>제안하는 기능 설명</li>
						<li>필요한 이유 및 사용 사례</li>
						<li>예상 사용자 혜택</li>
						<li>참고 자료 (유사 서비스 예시 등)</li>
					</ul>
				</div>

				<div class="type-card">
					<div class="type-header">
						<span class="type-icon">🤝</span>
						<h3>제휴 문의</h3>
					</div>
					<p>광고, 협찬, 데이터 제휴 등 비즈니스 관련 문의는 아래 정보를 포함해 주세요:</p>
					<ul>
						<li>회사/단체명 및 담당자 정보</li>
						<li>제휴 목적 및 내용</li>
						<li>제안서 (첨부 가능)</li>
						<li>희망 협업 기간 및 조건</li>
					</ul>
				</div>
			</div>
		</section>

		<section>
			<h2>자주 묻는 질문</h2>
			<p class="faq-intro">문의 전에 자주 묻는 질문을 확인해 보세요.</p>
			<div class="faq-preview">
				<div class="faq-item">
					<h4>Q. CourtNow는 무엇인가요?</h4>
					<p>
						수도권 공공 테니스장 예약 현황을 실시간으로 확인할 수 있는
						서비스입니다.
					</p>
				</div>

				<div class="faq-item">
					<h4>Q. 예약 현황은 얼마나 자주 업데이트되나요?</h4>
					<p>매 1분마다 자동으로 업데이트됩니다.</p>
				</div>

				<div class="faq-item">
					<h4>Q. 직접 예약도 가능한가요?</h4>
					<p>
						CourtNow는 예약 현황 확인 서비스이며, 실제 예약은 각 테니스장의 공식 웹사이트나
						전화로 하셔야 합니다.
					</p>
				</div>

				<div class="faq-item">
					<h4>Q. 서비스는 무료인가요?</h4>
					<p>네, CourtNow는 완전히 무료로 제공되는 서비스입니다.</p>
				</div>

				<div class="faq-item">
					<h4>Q. 로그인이 필요한가요?</h4>
					<p>아니요, 로그인 없이 모든 기능을 자유롭게 이용하실 수 있습니다.</p>
				</div>
			</div>

			<a href="/faq" class="faq-link">모든 FAQ 보기 →</a>
		</section>

		<section class="note-section">
			<h2>참고 사항</h2>
			<ul>
				<li>스팸 메일 차단으로 인해 답변 메일이 스팸함으로 분류될 수 있습니다. 확인 부탁드립니다.</li>
				<li>악의적인 문의나 광고성 메일은 답변하지 않습니다.</li>
				<li>개인정보가 포함된 문의는 안전하게 처리 후 즉시 삭제됩니다.</li>
				<li>주말 및 공휴일에 접수된 문의는 다음 평일부터 처리됩니다.</li>
			</ul>
		</section>
	</Card>
</PageWrapper>

<style>
	h2 {
		color: var(--color-text-primary);
		font-size: var(--text-2xl);
		margin-top: var(--space-8);
		margin-bottom: var(--space-6);
		padding-bottom: var(--space-3);
		border-bottom: 2px solid var(--color-primary-400);
	}

	h3 {
		color: var(--color-text-primary);
		font-size: var(--text-lg);
		margin-bottom: var(--space-2);
		font-weight: var(--font-semibold);
	}

	h4 {
		color: var(--color-text-primary);
		font-size: var(--text-base);
		margin-bottom: var(--space-2);
		font-weight: var(--font-semibold);
	}

	p {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-3);
	}

	/* Contact Info Section */
	.contact-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-6);
		margin-bottom: var(--space-8);
	}

	.info-item {
		padding: var(--space-4);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-light);
	}

	.email-primary {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--color-primary-600);
		background: var(--color-primary-50);
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		text-align: center;
		margin-bottom: var(--space-2);
	}

	.email-secondary {
		font-size: var(--text-sm);
		color: var(--color-text-tertiary);
		text-align: center;
		margin-bottom: 0;
	}

	.note {
		font-size: var(--text-sm);
		color: var(--color-text-tertiary);
		margin-top: var(--space-2);
		margin-bottom: 0;
	}

	/* Inquiry Types Section */
	.inquiry-types {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.type-card {
		padding: var(--space-5);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-md);
		transition: all 0.2s;
	}

	.type-card:hover {
		border-color: var(--color-primary-400);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.type-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.type-icon {
		font-size: var(--text-2xl);
	}

	.type-card ul {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		padding-left: var(--space-5);
		margin-top: var(--space-3);
		margin-bottom: 0;
	}

	.type-card li {
		margin-bottom: var(--space-2);
		line-height: var(--leading-relaxed);
	}

	/* FAQ Preview Section */
	.faq-intro {
		margin-bottom: var(--space-4);
		font-weight: var(--font-medium);
	}

	.faq-preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.faq-item {
		padding: var(--space-4);
		background: var(--color-primary-50);
		border-left: 3px solid var(--color-primary-400);
		border-radius: var(--radius-sm);
	}

	.faq-item h4 {
		color: var(--color-primary-700);
		margin-bottom: var(--space-2);
	}

	.faq-item p {
		margin-bottom: 0;
		font-size: var(--text-sm);
	}

	.faq-link {
		display: inline-block;
		padding: var(--space-3) var(--space-5);
		background: var(--color-primary-600);
		color: white;
		text-decoration: none;
		border-radius: var(--radius-md);
		font-weight: var(--font-semibold);
		transition: background 0.2s;
	}

	.faq-link:hover {
		background: var(--color-primary-700);
	}

	/* Note Section */
	.note-section {
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-border-light);
	}

	.note-section ul {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		padding-left: var(--space-5);
		line-height: var(--leading-relaxed);
	}

	.note-section li {
		margin-bottom: var(--space-2);
	}

	a {
		color: var(--color-primary-600);
		text-decoration: underline;
	}

	a:hover {
		color: var(--color-primary-700);
	}

	@media (max-width: 768px) {
		.contact-info {
			grid-template-columns: 1fr;
		}

		.inquiry-types {
			grid-template-columns: 1fr;
		}
	}
</style>
