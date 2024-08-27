<script setup lang="ts">
import {ref} from "vue";

defineProps<PromptBoxProps>()

interface PromptBoxProps {
  prompt: string,
}

const emit = defineEmits<Emits>()
const answer = ref<string>('')

interface Emits {
  (event: 'submitAnswer', answer: string): void
}

const submitResponse = () => {
  emit('submitAnswer', answer.value)
}
</script>

<template>
  <p>{{prompt}}</p>
  <input placeholder="Type your Response!" v-model="answer"/>
  <button @click="submitResponse()">Submit Answer</button>
</template>

<style scoped>

</style>