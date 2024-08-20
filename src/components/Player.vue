<script setup lang="ts">
defineProps<PlayerProps>()

interface PlayerProps {
  status: string,
  username: string
}
</script>

<template>
  <h4>{{username}}
    <span v-if="status === 'submitted'">
     ✅
    </span>
    <span v-if="status === 'answering'">
     💭
    </span>
    <span v-if="status === 'eliminated'">
     💀
    </span>
  </h4>
</template>

<style scoped>

</style>