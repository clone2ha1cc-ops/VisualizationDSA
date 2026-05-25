<template>
  <div class="leaderboard-view">
    <LeaderboardPanel :limit="20" />
  </div>
</template>

<script setup lang="ts">
import LeaderboardPanel from '../features/leaderboard/components/LeaderboardPanel.vue';
</script>

<style scoped>
.leaderboard-view {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
