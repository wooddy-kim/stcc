<footer class="footer">
	<div class="footer-content">
		<div class="footer-section">
			<h4>CourtNow</h4>
			<p class="footer-description">수도권 공공 테니스장 예약 현황을 제공하는 서비스입니다.</p>
		</div>

		<div class="footer-section">
			<h4>페이지</h4>
			<ul class="footer-links">
				<li><a href="/about">소개</a></li>
				<li><a href="/content">테니스 팁 & 전략</a></li>
				<li><a href="/faq">자주 묻는 질문</a></li>
				<li><a href="/stats">통계</a></li>
				<li><a href="/glossary">용어 사전</a></li>
				<li>
					<a href="https://match-point.courtnow.info/" target="_blank" rel="noopener noreferrer"
						>매치포인트</a
					>
				</li>
			</ul>
		</div>

		<div class="footer-section">
			<h4>정책</h4>
			<ul class="footer-links">
				<li><a href="/privacy">개인정보처리방침</a></li>
				<li><a href="/terms">이용약관</a></li>
				<li><a href="/contact">문의하기</a></li>
			</ul>
		</div>

		<div class="footer-section">
			<h4>문의</h4>
			<p class="contact-info">wodn4131@gmail.com</p>
		</div>
	</div>

	<div class="footer-bottom">
		<p>&copy; {new Date().getFullYear()} CourtNow. All rights reserved.</p>
	</div>
</footer>

<style>
	.footer {
		background: #1f2937;
		color: #f3f4f6;
		padding: 2rem 1rem 1rem;
		margin-top: 2rem;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
	}

	.footer-section h4 {
		color: var(--color-primary-300);
		margin-bottom: 1rem;
		font-size: 1rem;
	}

	.footer-description {
		color: #d1d5db;
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0;
	}

	.footer-links {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.footer-links li {
		margin-bottom: 0.5rem;
	}

	.footer-links a {
		color: #d1d5db;
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.footer-links a:hover {
		color: var(--color-primary-500);
	}

	.contact-info {
		color: #d1d5db;
		font-size: 0.875rem;
		margin: 0 0 0.5rem 0;
	}

	.footer-bottom {
		max-width: 1200px;
		margin: 2rem auto 0;
		padding-top: 1rem;
		border-top: 1px solid #374151;
		text-align: center;
	}

	.footer-bottom p {
		color: #9ca3af;
		font-size: 0.75rem;
		margin: 0;
	}

	@media (max-width: 768px) {
		.footer {
			padding: 1.5rem 1rem 1rem;
		}

		.footer-content {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}
</style>
