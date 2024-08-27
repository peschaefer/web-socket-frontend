<script setup lang="ts">
import {PlayerData} from "../types/types.ts";

defineProps<PlayerDisplayProps>()

interface PlayerDisplayProps {
  players: PlayerData[],
}

// Compute the image source based on the status prop
const getImageSource = (status: string) => {
  switch (status) {
    case 'answering':
      return '../src/assets/thinking.png'
    case 'submitted':
      return '../src/assets/idea.png'
    default:
      return '../src/assets/dead.png'
  }
}
</script>

<template>
  <div class="players-container">
    <div class="player" v-for="player in players">
      <p class="username">{{player.username}}</p>
      <img :src="getImageSource(player.status)" alt="player status"/>
      <div v-for="letter in player.letters" class="letter-crate">
        <p>{{ letter }}</p>
        <img src="../assets/crate.png" alt="crate"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.letter-crate{
  position: relative;
}

.letter-crate p{
  position: absolute;
  left: calc(50% - 5px);
  width: 10px;
}

.players-container{
  display: flex;
  justify-content: center;
}

.player{
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>