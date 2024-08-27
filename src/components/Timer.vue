<script setup lang="ts">
defineProps<TimerProps>()

interface TimerProps {
  time: number,
}
</script>

<template>
<p>{{time}}</p>
</template>

<style scoped>

</style>