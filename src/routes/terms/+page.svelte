<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import PageWrapper from '$lib/components/layout/PageWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
</script>

<svelte:head>
	<title>이용약관 - CourtNow</title>
	<meta name="description" content="CourtNow 이용약관" />
	<link rel="canonical" href="https://courtnow.info/terms" />
</svelte:head>

<PageWrapper variant="narrow">
	<PageHeader title="이용약관" size="md" showDecoration />
	<Card padding="lg">

		<section>
			<h2>제1조(목적)</h2>
			<p>이 약관은 CourtNow(이하 "회사")가 제공하는 테니스장 예약 현황 조회 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
		</section>

		<section>
			<h2>제2조(정의)</h2>
			<p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
			<ul>
				<li>"이용자"란 서비스에 접속하여 이 약관에 따라 서비스를 받는 회원 및 비회원을 말합니다.</li>
				<li>"서비스"란 회사가 이용자에게 제공하는 테니스장 예약 현황 조회 서비스를 의미합니다.</li>
			</ul>
		</section>

		<section>
			<h2>제3조(약관의 명시와 개정)</h2>
			<ol>
				<li>회사는 이 약관의 내용과 상호, 영업소 소재지, 대표자의 성명, 사업자등록번호 등을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
				<li>회사는 「약관의 규제에 관한 법률」, 「전자문서 및 전자거래기본법」, 「전자서명법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「소비자기본법」, 「개인정보보호법」 등 관련 법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
			</ol>
		</section>

		<section>
			<h2>제4조(서비스의 제공 및 변경)</h2>
			<ol>
				<li>회사는 다음과 같은 업무를 수행합니다:
					<ul>
						<li>테니스장 예약 현황 정보 제공</li>
						<li>서비스 이용 관련 문의 응답</li>
						<li>기타 서비스 운영에 필요한 사항</li>
					</ul>
				</li>
				<li>회사는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 서비스의 내용을 변경할 수 있으며, 이 경우에는 변경된 서비스의 내용 및 제공일자를 명시하여 현재의 서비스 내용을 게시한 곳에 즉시 공지합니다.</li>
			</ol>
		</section>

		<section>
			<h2>제5조(서비스의 중단)</h2>
			<ol>
				<li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
				<li>회사가 사업종목의 전환, 사업의 포기, 업체 간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 서비스 제공을 중지하거나 종료할 수 있습니다.</li>
			</ol>
		</section>

		<section>
			<h2>제6조(이용자 의무)</h2>
			<ol>
				<li>이용자는 다음 행위를 하여서는 안 됩니다:
					<ul>
						<li>신청 또는 변경 시 허위 내용의 등록</li>
						<li>타인의 정보 도용</li>
						<li>회사가 게시한 정보의 변경</li>
						<li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
						<li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
						<li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
						<li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
					</ul>
				</li>
			</ol>
		</section>

		<section>
			<h2>제7조(면책)</h2>
			<ol>
				<li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관하여 책임이 면제됩니다.</li>
				<li>회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
				<li>회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그밖에 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
			</ol>
		</section>

		<section>
			<h2>제8조(분쟁 해결)</h2>
			<p>회사와 이용자 간에 분쟁이 발생하여 소송이 제기되는 경우에는 서울중앙지방법원을 제1심 관할 법원으로 합니다.</p>
		</section>

		<section class="last-updated">
			<p><strong>시행일:</strong> 2025년 1월 1일</p>
		</section>
	</Card>
</PageWrapper>

<style>
	h2 {
		color: var(--color-text-primary);
		margin-top: var(--space-8);
		margin-bottom: var(--space-4);
	}

	p {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-4);
	}

	ul, ol {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		padding-left: var(--space-6);
		margin-bottom: var(--space-4);
	}

	li {
		margin-bottom: var(--space-2);
	}

	.last-updated {
		margin-top: var(--space-8);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border-light);
		text-align: center;
	}

	.last-updated p {
		margin-bottom: 0;
		color: var(--color-text-tertiary);
		font-size: var(--text-sm);
	}

</style>
