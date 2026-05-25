<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="viewBox"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="className"
  >
    <!-- 1. Navigation / Route Icons -->
    <g v-if="name === 'sorting'">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </g>
    <g v-else-if="name === 'dsa'">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </g>
    <g v-else-if="name === 'animation'">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </g>
    <g v-else-if="name === 'code-ide'">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </g>
    <g v-else-if="name === 'compare'">
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="7" x2="21" y2="7" />
      <path d="M6 7l-3 9h6l-3-9z" />
      <path d="M18 7l-3 9h6l-3-9z" />
    </g>
    <g v-else-if="name === 'concurrency'">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </g>
    <g v-else-if="name === 'debug'">
      <rect x="5" y="3" width="14" height="14" rx="2" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="8" y1="8" x2="2" y2="8" />
      <line x1="16" y1="8" x2="22" y2="8" />
      <line x1="8" y1="12" x2="2" y2="14" />
      <line x1="16" y1="12" x2="22" y2="14" />
      <path d="M6 21c0-1.5 2-3 6-3s6 1.5 6 3" />
    </g>
    <g v-else-if="name === 'graph'">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="10.51" x2="15.42" y2="6.49" />
      <line x1="8.59" y1="13.49" x2="15.42" y2="17.51" />
    </g>
    <g v-else-if="name === 'playground'">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </g>
    <g v-else-if="name === 'oop'">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </g>
    <g v-else-if="name === 'solid'">
      <line x1="3" y1="21" x2="21" y2="21" />
      <rect x="5" y="3" width="14" height="15" rx="2" />
      <line x1="5" y1="8" x2="19" y2="8" />
      <line x1="5" y1="13" x2="19" y2="13" />
      <line x1="12" y1="3" x2="12" y2="18" />
    </g>
    <g v-else-if="name === 'di'">
      <line x1="12" y1="2" x2="12" y2="8" />
      <path d="M5 8h14v4a7 7 0 0 1-14 0V8z" />
      <line x1="9" y1="15" x2="9" y2="22" />
      <line x1="15" y1="15" x2="15" y2="22" />
    </g>
    <g v-else-if="name === 'patterns'">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03458 19.176 5.0924 19.4352 5.00693 19.6732C4.78913 20.2801 4.54228 20.8415 4.26909 21.3528C4.1068 21.6565 4.31682 22 4.66282 22H12Z" />
      <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
      <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor" />
    </g>
    <g v-else-if="name === 'state'">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </g>
    <g v-else-if="name === 'system'">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </g>
    <g v-else-if="name === 'quiz'">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </g>
    <g v-else-if="name === 'gamification' || name === 'leaderboard' || name === 'trophy'">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </g>
    <g v-else-if="name === 'checkout' || name === 'diamond'">
      <polygon points="6 3 18 3 22 9 12 21 2 9 6 3" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </g>

    <!-- 2. Utility & Interaction Icons -->
    <g v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </g>
    <g v-else-if="name === 'database'">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </g>
    <g v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12" />
    </g>
    <g v-else-if="name === 'zap'">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </g>
    <g v-else-if="name === 'warning'">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </g>
    <g v-else-if="name === 'success'">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 11 12 14 17 9" />
    </g>
    <g v-else-if="name === 'medal'">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </g>
    <g v-else-if="name === 'streak' || name === 'streak-keeper'">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </g>
    <g v-else-if="name === 'badge'">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </g>
    <g v-else-if="name === 'refresh'">
      <path d="M21.5 2v6h-6" />
      <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </g>

    <!-- 3. VCR Player Buttons -->
    <g v-else-if="name === 'play'">
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </g>
    <g v-else-if="name === 'pause'">
      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
    </g>
    <g v-else-if="name === 'stop'">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
    </g>
    <g v-else-if="name === 'step-forward'">
      <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </g>
    <g v-else-if="name === 'step-backward'">
      <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
      <line x1="5" y1="19" x2="5" y2="5" />
    </g>
    <g v-else-if="name === 'spinner'">
      <circle cx="12" cy="12" r="10" />
    </g>

    <!-- 4. Gamification Badge SVGs mapped from IDs -->
    <g v-else-if="name === 'first-steps'">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </g>
    <g v-else-if="name === 'sorting-wizard'">
      <polygon points="12 2 3 9 9 9 9 22 15 22 15 9 21 9 12 2" />
    </g>
    <g v-else-if="name === 'oop-guru'">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </g>
    <g v-else-if="name === 'solid-master'">
      <path d="M4 22V4c0-.5.5-1 1-1h14c.5 0 1 .5 1 1v18M12 22V10" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="4" y1="15" x2="20" y2="15" />
    </g>
    <g v-else-if="name === 'pattern-hunter'">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <circle cx="11" cy="11" r="3" fill="currentColor" />
    </g>
    <g v-else-if="name === 'system-architect'">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="10" x2="6" y2="14" />
      <line x1="18" y1="10" x2="18" y2="14" />
    </g>
    <g v-else-if="name === 'dsa-champion'">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" />
      <rect x="5" y="18" width="14" height="3" rx="1" />
    </g>

    <!-- Fallback if icon name is unknown -->
    <g v-else>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name: string;
    strokeWidth?: number | string;
    class?: string;
  }>(),
  {
    strokeWidth: 2,
    class: '',
  }
);

const viewBox = computed(() => {
  if (props.name === 'bluesky-icon') return '0 0 16 17';
  if (props.name === 'discord-icon') return '0 0 20 19';
  if (props.name === 'github-icon') return '0 0 19 19';
  return '0 0 24 24';
});

const className = computed(() => {
  return `base-icon ${props.class}`;
});
</script>

<style scoped>
.base-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
