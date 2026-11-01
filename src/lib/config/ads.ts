/**
 * AdSense 광고 슬롯 ID.
 *
 * 슬롯이 페이지 코드에 흩어져 있으면 같은 슬롯을 같은 페이지에 두 번 쓴 것을
 * 알아채기 어렵다. 중복되면 AdSense 광고 단위별 보고서에서 성과가 합쳐져
 * 어느 위치가 잘 되는지 판단할 수 없다.
 *
 * 같은 페이지 중복은 모두 해소됐다 — 한 페이지 안에서는 슬롯이 전부 서로 다르다.
 *
 * `2783820551`(contentList.inArticle / contentDetail.top / courtDetail.afterHero)과
 * `3494662801`(contentDetail.bottom / courtDetail.afterInfo)은 의도적으로 공유한다.
 * 서로 **다른 페이지**라 노출 손실이 없고, 페이지별 성과 분리는 유보한 결정이다.
 * glossary·faq·region도 같은 이유로 기존 슬롯을 재사용한다. 성과를 분리하려면 콘솔에서 새 단위를 만들어 교체한다.
 */
export const AD_SLOTS = {
	home: {
		top: '7433907812',
		topMobile: '6093626167',
		mid: '4807744477',
		listBottom: '1693741374',
		footer: '6200376560'
	},
	contentList: {
		inArticle: '2783820551',
		inFeed: '4696063838'
	},
	contentDetail: {
		top: '2783820551',
		bottom: '3494662801'
	},
	courtDetail: {
		afterHero: '2783820551',
		afterInfo: '3494662801'
	},
	glossary: {
		inList: '2783820551',
		inListLower: '4696063838'
	},
	faq: {
		afterList: '3494662801'
	},
	region: {
		afterList: '3494662801'
	},
	stats: {
		top: '7433907812',
		mid: '4807744477'
	}
} as const;
