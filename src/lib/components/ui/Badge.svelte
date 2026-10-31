<script lang="ts">
	/**
	 * Badge - 태그/뱃지 컴포넌트
	 *
	 * @param variant - 뱃지 종류 ('category' | 'difficulty' | 'default')
	 * @param color - 색상 키 (variant에 따른 프리셋 또는 커스텀)
	 * @param size - 크기 ('sm' | 'md')
	 */
	export let variant: 'category' | 'difficulty' | 'default' = 'default';
	export let color: string = '';
	export let size: 'sm' | 'md' = 'md';

	// 카테고리별 색상 프리셋
	const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
		// Korean keys
		'서브': { bg: '#ffd1d1', text: '#b91c1c', label: '서브' },
		'스트로크': { bg: '#bfdbfe', text: '#1e40af', label: '스트로크' },
		'발리': { bg: '#fef08a', text: '#a16207', label: '발리/풋워크' },
		'전술': { bg: '#e9d5ff', text: '#7c3aed', label: '전술' },
		'멘탈': { bg: '#bbf7d0', text: '#15803d', label: '멘탈' },
		'기타': { bg: '#fbcfe8', text: '#be185d', label: '기타' },
		// English keys (DB stores these)
		'strategy':    { bg: '#e9d5ff', text: '#7c3aed', label: '전술' },
		'strokes':     { bg: '#bfdbfe', text: '#1e40af', label: '스트로크' },
		'serving':     { bg: '#ffd1d1', text: '#b91c1c', label: '서브' },
		'movement':    { bg: '#fef08a', text: '#a16207', label: '발리/풋워크' },
		'mental-game': { bg: '#bbf7d0', text: '#15803d', label: '멘탈' },
		'training':    { bg: '#dbeafe', text: '#1e40af', label: '훈련' },
		'lifestyle':   { bg: '#fbcfe8', text: '#be185d', label: '라이프스타일' },
		'equipment':   { bg: '#e5e7eb', text: '#374151', label: '장비' }
	};

	// 난이도별 색상 프리셋
	const difficultyColors: Record<string, { bg: string; text: string; label: string }> = {
		// Korean keys
		'초급': { bg: '#d1fae5', text: '#065f46', label: '초급' },
		'중급': { bg: '#fed7aa', text: '#c2410c', label: '중급' },
		'고급': { bg: '#fecaca', text: '#991b1b', label: '고급' },
		'전문가': { bg: '#ddd6fe', text: '#5b21b6', label: '전문가' },
		// English keys
		'beginner':     { bg: '#d1fae5', text: '#065f46', label: '초급' },
		'intermediate': { bg: '#fed7aa', text: '#c2410c', label: '중급' },
		'advanced':     { bg: '#fecaca', text: '#991b1b', label: '고급' },
		'expert':       { bg: '#ddd6fe', text: '#5b21b6', label: '전문가' }
	};

	// 기본 색상
	const defaultColor = { bg: '#e5e7eb', text: '#374151', label: '' };

	function getColorStyle(): { bg: string; text: string; label: string } {
		if (variant === 'category') {
			return categoryColors[color] || categoryColors['기타'];
		}
		if (variant === 'difficulty') {
			return difficultyColors[color] || difficultyColors['초급'];
		}
		return defaultColor;
	}

	$: colorStyle = getColorStyle();
</script>

<span
	class="badge"
	class:size-sm={size === 'sm'}
	class:size-md={size === 'md'}
	style="background-color: {colorStyle.bg}; color: {colorStyle.text};"
>
	<slot>{colorStyle.label || color}</slot>
</span>

<style>
	.badge {
		display: inline-block;
		border-radius: var(--radius-full);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.025em;
		white-space: nowrap;
	}

	.size-sm {
		padding: 0.125rem var(--space-3);
		font-size: 0.625rem;
	}

	.size-md {
		padding: var(--space-1) var(--space-4);
		font-size: var(--text-xs);
	}
</style>
