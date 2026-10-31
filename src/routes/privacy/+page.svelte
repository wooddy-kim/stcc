<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import PageWrapper from '$lib/components/layout/PageWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
</script>

<svelte:head>
	<title>개인정보처리방침 - CourtNow</title>
	<meta name="description" content="CourtNow 개인정보처리방침 - 쿠키 정책, 제3자 서비스 이용, 사용자 권리 및 개인정보 보안 정책" />
	<link rel="canonical" href="https://courtnow.info/privacy" />
</svelte:head>

<PageWrapper variant="narrow">
	<PageHeader title="개인정보처리방침" size="md" showDecoration />
	<Card padding="lg">

		<section>
			<h2>1. 개인정보의 수집 및 이용 목적</h2>
			<p>CourtNow은 다음과 같은 목적을 위해 필요한 최소한의 개인정보를 수집 및 이용합니다:</p>
			<ul>
				<li>서비스 제공 및 운영</li>
				<li>회원 관리</li>
				<li>서비스 개선 및 분석</li>
			</ul>
		</section>

		<section>
			<h2>2. 수집하는 개인정보 항목</h2>
			<p>CourtNow은 기본적으로 다음과 같은 정보를 수집하지 않습니다:</p>
			<ul>
				<li>이름, 주소, 전화번호 등 개인을 식별할 수 있는 정보</li>
				<li>계정 생성 또는 로그인 정보</li>
			</ul>
			<p>다만, 서비스 개선을 위해 다음의 정보를 자동으로 수집될 수 있습니다:</p>
			<ul>
				<li>IP 주소</li>
				<li>브라우저 종류 및 버전</li>
				<li>접근 시간 및 서비스 이용 기록</li>
			</ul>
		</section>

		<section>
			<h2>3. 개인정보의 보유 및 이용 기간</h2>
			<p>사용자의 개인정보는 수집 목적 달성 시 지체 없이 파기됩니다.</p>
		</section>

		<section>
			<h2>4. 개인정보의 파기 절차 및 방법</h2>
			<p>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄하거나 소각하여 파기합니다.</p>
		</section>

		<section>
			<h2>5. 쿠키 사용 정책</h2>
			<p>CourtNow는 서비스 제공 및 개선을 위해 쿠키를 사용합니다.</p>

			<h3>5.1 쿠키란?</h3>
			<p>쿠키는 웹사이트 방문 시 브라우저에 저장되는 작은 텍스트 파일로, 사용자의 선호 설정과 방문 정보를 기억합니다.</p>

			<h3>5.2 쿠키 사용 목적</h3>
			<ul>
				<li><strong>필수 쿠키:</strong> 서비스 기본 기능 제공, 보안 유지</li>
				<li><strong>분석 쿠키:</strong> 서비스 이용 통계 분석 (Google Analytics)</li>
				<li><strong>광고 쿠키:</strong> 맞춤형 광고 제공 (Google AdSense)</li>
			</ul>

			<h3>5.3 쿠키 거부 방법</h3>
			<p>브라우저 설정에서 쿠키를 거부하거나 삭제할 수 있습니다:</p>
			<ul>
				<li>Chrome: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</li>
				<li>Safari: 환경설정 &gt; 개인정보 보호 &gt; 쿠키 및 웹사이트 데이터</li>
				<li>Firefox: 설정 &gt; 개인정보 보호 및 보안 &gt; 쿠키 및 사이트 데이터</li>
			</ul>
			<p class="note">일부 쿠키를 거부할 경우 서비스 이용에 제한이 있을 수 있습니다.</p>
		</section>

		<section>
			<h2>6. 제3자 서비스 이용</h2>
			<p>CourtNow는 다음의 제3자 서비스를 이용하며, 각 서비스는 독자적인 개인정보 처리 정책을 가지고 있습니다:</p>

			<h3>6.1 Google AdSense</h3>
			<ul>
				<li><strong>목적:</strong> 광고 게재 및 맞춤형 광고 제공</li>
				<li><strong>수집 정보:</strong> 쿠키, IP 주소, 브라우저 정보, 광고 상호작용 기록</li>
				<li><strong>정책:</strong> <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google 광고 정책</a></li>
			</ul>

			<h3>6.2 Google Analytics</h3>
			<ul>
				<li><strong>목적:</strong> 서비스 이용 통계 분석 및 개선</li>
				<li><strong>수집 정보:</strong> 페이지 조회수, 체류 시간, 유입 경로, 사용자 행동 패턴</li>
				<li><strong>정책:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google 개인정보처리방침</a></li>
			</ul>

			<h3>6.3 Coupang Partners (제휴 마케팅)</h3>
			<ul>
				<li><strong>목적:</strong> 상품 추천 및 제휴 마케팅</li>
				<li><strong>수집 정보:</strong> 쿠폰 클릭 정보, 구매 전환 데이터</li>
				<li><strong>정책:</strong> <a href="https://www.coupang.com/np/policies/privacy" target="_blank" rel="noopener noreferrer">쿠팡 개인정보처리방침</a></li>
			</ul>

			<p class="note">각 제3자 서비스의 개인정보 처리는 해당 서비스의 정책에 따라 관리됩니다.</p>
		</section>

		<section>
			<h2>7. 사용자의 권리</h2>
			<p>사용자는 개인정보와 관련하여 다음의 권리를 행사할 수 있습니다:</p>

			<h3>7.1 개인정보 열람 요청</h3>
			<p>CourtNow가 보유하고 있는 사용자의 개인정보를 확인할 수 있습니다.</p>

			<h3>7.2 개인정보 수정 및 삭제 요청</h3>
			<p>잘못된 개인정보의 수정 또는 삭제를 요청할 수 있습니다.</p>

			<h3>7.3 개인정보 처리 정지 요청</h3>
			<p>개인정보의 처리를 일시적으로 중단하도록 요청할 수 있습니다.</p>

			<h3>7.4 권리 행사 방법</h3>
			<p>위 권리를 행사하려면 아래 이메일로 요청서를 제출해 주시기 바랍니다:</p>
			<ul>
				<li><strong>이메일:</strong> wodn4131@gmail.com</li>
				<li><strong>처리 기간:</strong> 요청 접수 후 10일 이내 처리</li>
			</ul>
		</section>

		<section>
			<h2>8. 개인정보 보호책임자</h2>
			<p>CourtNow의 개인정보 처리에 관한 업무를 총괄하고, 사용자의 불만 처리 및 피해구제를 담당하는 책임자는 다음과 같습니다:</p>
			<ul>
				<li><strong>담당자:</strong> CourtNow 운영팀</li>
				<li><strong>이메일:</strong> wodn4131@gmail.com</li>
			</ul>

			<h3>8.1 개인정보 침해 신고 센터</h3>
			<p>개인정보 침해 관련 신고 및 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다:</p>
			<ul>
				<li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
				<li>대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301)</li>
				<li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)</li>
			</ul>
		</section>

		<section>
			<h2>9. 개인정보 보안</h2>
			<p>CourtNow는 사용자의 개인정보를 안전하게 보호하기 위해 다음의 기술적·관리적 조치를 취하고 있습니다:</p>

			<h3>9.1 기술적 보호조치</h3>
			<ul>
				<li><strong>암호화:</strong> 모든 데이터 전송 시 SSL/TLS 암호화 적용 (HTTPS)</li>
				<li><strong>접근 제어:</strong> 데이터베이스 접근 권한 제한 및 IP 필터링</li>
				<li><strong>로그 관리:</strong> 모든 접근 기록을 로그로 보관하여 비정상 접근 감지</li>
			</ul>

			<h3>9.2 관리적 보호조치</h3>
			<ul>
				<li>정기적인 보안 점검 및 업데이트</li>
				<li>개인정보 취급자 최소화 및 보안 교육</li>
				<li>개인정보 처리 시스템 접근 기록 보관 (6개월 이상)</li>
			</ul>
		</section>

		<section>
			<h2>10. 개인정보처리방침의 변경</h2>
			<p>이 개인정보처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용의 추가, 삭제 및 수정이 있을 수 있습니다. 개인정보처리방침이 변경되는 경우 웹사이트를 통해 공지하며, 중요한 변경 사항은 최소 7일 전에 사전 공지합니다.</p>
		</section>

		<section>
			<h2>11. 문의처</h2>
			<p>개인정보 보호와 관련된 문의는 아래 연락처로 해주시기 바랍니다:</p>
			<p class="contact">wodn4131@gmail.com</p>
		</section>

		<section class="last-updated">
			<p><strong>공고일자:</strong> 2025년 1월 1일</p>
			<p><strong>시행일자:</strong> 2025년 1월 1일</p>
			<p><strong>최종 수정일:</strong> 2025년 1월 25일</p>
		</section>
	</Card>
</PageWrapper>

<style>
	h2 {
		color: var(--color-text-primary);
		margin-top: var(--space-8);
		margin-bottom: var(--space-4);
	}

	h3 {
		color: var(--color-text-primary);
		margin-top: var(--space-6);
		margin-bottom: var(--space-3);
		font-size: var(--text-lg);
	}

	p {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-4);
	}

	ul {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		padding-left: var(--space-6);
		margin-bottom: var(--space-4);
	}

	li {
		margin-bottom: var(--space-2);
	}

	a {
		color: var(--color-primary-600);
		text-decoration: underline;
	}

	a:hover {
		color: var(--color-primary-700);
	}

	.contact {
		font-weight: var(--font-semibold);
		color: var(--color-primary-600);
		background: var(--color-primary-50);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		text-align: center;
		margin-bottom: var(--space-2);
	}

	.note {
		background: var(--color-warning-50);
		color: var(--color-warning-800);
		padding: var(--space-3);
		border-left: 3px solid var(--color-warning-400);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		margin-top: var(--space-4);
	}

	.last-updated {
		margin-top: var(--space-8);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border-light);
	}

	.last-updated p {
		margin-bottom: var(--space-2);
		color: var(--color-text-tertiary);
		font-size: var(--text-sm);
	}

</style>
