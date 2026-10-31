<script lang="ts">
  import { browser } from '$app/environment';

  interface TocItem {
    id: string;
    level: number;
    text: string;
  }

  let { toc, activeId = $bindable('') }: { toc: TocItem[]; activeId?: string } = $props();

  let isOpen = $state(false);
</script>

{#if toc.length > 0}
  <!-- Desktop: sticky sidebar (shown via CSS at >1024px) -->
  <nav class="toc-desktop" aria-label="목차">
    <h3 class="toc-title">
      <span class="toc-title-accent"></span>
      목차
    </h3>
    <ul class="toc-list">
      {#each toc as item, i}
        <li class="toc-item" class:toc-h3={item.level === 3} class:toc-active={activeId === item.id}>
          <a href="#{item.id}" class="toc-link">
            {#if item.level === 2}
              <span class="toc-num">{i + 1}</span>
            {/if}
            <span class="toc-text">{item.text}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Mobile: accordion (shown via CSS at <=1024px) -->
  <div class="toc-mobile">
    <button class="toc-toggle" onclick={() => isOpen = !isOpen} aria-expanded={isOpen}>
      <span class="toc-toggle-label">
        <span class="toc-title-accent-sm"></span>
        목차
      </span>
      <span class="toc-toggle-icon" class:open={isOpen}>▼</span>
    </button>
    {#if isOpen}
      <nav class="toc-accordion" aria-label="목차">
        <ul class="toc-list">
          {#each toc as item}
            <li class="toc-item" class:toc-h3={item.level === 3} class:toc-active={activeId === item.id}>
              <a href="#{item.id}" class="toc-link" onclick={() => isOpen = false}>
                <span class="toc-text">{item.text}</span>
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}
  </div>
{/if}

<style>
  /* Desktop TOC */
  .toc-desktop {
    display: none;
    position: sticky;
    top: 2rem;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    padding: 1.25rem 1rem;
    background: var(--color-bg-secondary, #f9fafb);
    border: 1px solid var(--color-border-light, #e5e7eb);
    border-radius: 0.75rem;
  }

  @media (min-width: 1024px) {
    .toc-desktop { display: block; }
    .toc-mobile  { display: none; }
  }

  /* Mobile TOC */
  .toc-mobile {
    margin-bottom: 1.5rem;
    border: 1px solid var(--color-border-light, #e5e7eb);
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .toc-toggle {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 1rem;
    background: var(--color-bg-secondary, #f9fafb);
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--color-text-primary, #111827);
  }

  .toc-toggle-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
  }

  .toc-title-accent-sm {
    display: inline-block;
    width: 3px;
    height: 0.875rem;
    background: var(--color-primary-500, #10b981);
    border-radius: 2px;
  }

  .toc-toggle-icon {
    transition: transform 0.2s;
    font-size: 0.625rem;
    color: var(--color-text-disabled);
  }

  .toc-toggle-icon.open {
    transform: rotate(180deg);
  }

  .toc-accordion {
    padding: 0.625rem 1rem 1rem;
    background: var(--color-bg-primary, #fff);
  }

  /* Shared */
  .toc-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-disabled, #9ca3af);
    margin: 0 0 1rem 0;
  }

  .toc-title-accent {
    display: inline-block;
    width: 3px;
    height: 0.8rem;
    background: var(--color-primary-500, #10b981);
    border-radius: 2px;
    flex-shrink: 0;
  }

  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .toc-item {
    margin-bottom: 0.125rem;
  }

  .toc-h3 {
    padding-left: 1.125rem;
  }

  .toc-link {
    display: flex;
    align-items: baseline;
    gap: 0.375rem;
    padding: 0.3rem 0.5rem;
    font-size: 0.8rem;
    color: var(--color-text-secondary, #6b7280);
    text-decoration: none;
    border-radius: 0.375rem;
    line-height: 1.4;
    transition: all 0.15s ease;
    border-left: 2px solid transparent;
  }

  .toc-link:hover {
    color: var(--color-primary-700, #047857);
    background: var(--color-primary-50, #ecfdf5);
    border-left-color: var(--color-primary-300, #6ee7b7);
  }

  .toc-num {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--color-primary-400, #34d399);
    flex-shrink: 0;
    min-width: 1rem;
    line-height: 1;
  }

  .toc-text {
    flex: 1;
  }

  .toc-active .toc-link {
    color: var(--color-primary-700, #047857);
    background: var(--color-primary-50, #ecfdf5);
    font-weight: 600;
    border-left: 3px solid var(--color-primary-500, #10b981);
    padding-left: 0.375rem;
  }

  .toc-active .toc-num {
    color: var(--color-primary-600, #059669);
  }
</style>
