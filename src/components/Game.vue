<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import Player from "./Player.vue";
import Timer from "./Timer.vue";
import {GameData, GameStatus} from "../types/types.ts";
import PlayerDisplay from "./PlayerDisplay.vue";
import PromptBox from "./PromptBox.vue";

const socket = ref<WebSocket | null>(null);
const time = ref(0);
const userId = ref(null);
const messages = ref<{ message: string }[]>([]);
const roomCode = ref('');
const roomCodeInput = ref('');
const username = ref('');
const status = ref<GameStatus>(GameStatus.Pregame);
const gameData = ref<GameData>(null)

// Function to connect to the WebSocket server
const connect = () => {
  socket.value = new WebSocket('ws://localhost:8080/ws');

  socket.value.onopen = () => {
    console.log('Connected to WebSocket');
  };

  socket.value.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    messages.value.push(data);

    switch(data.type){
      case "game-created":
        roomCode.value = data.content.roomCode;
        console.log(roomCode.value);
        joinRoom(roomCode.value);
        return
      case "joined-game":
        status.value = GameStatus.InLobby;
        userId.value = data.content.userId;
        roomCode.value = data.content.roomCode;
        return
      case "countdown":
        time.value = data.content.timeRemaining;
        return
      case "game-started":
      case "round-started":
        status.value = GameStatus.Playing;
        gameData.value = data.content satisfies GameData
        return
      case "post-round-adjustment":
      case "game-updated":
        console.log(data.type)
        gameData.value = data.content satisfies GameData
        return
      case "round-completed":
        status.value = GameStatus.BetweenRounds;
        gameData.value = data.content satisfies GameData
        return
    }
  };

  socket.value.onclose = () => {
    console.log('WebSocket connection closed');
  };

  socket.value.onerror = (error: Event) => {
    console.error('WebSocket error:', error);
  };
}

const createRoom = () => {
  let message = { type: 'create-game', content: "" };
  socket.value.send(JSON.stringify(message));
}

const joinRoom = (roomCode) => {
  const message = { type: 'join-game', content: {roomCode: roomCode, username: username.value} };
  socket.value.send(JSON.stringify(message));
}

const startGame = () => {
  const message = { type: 'start-game', content: {roomCode: roomCode.value, username: username.value} };
  socket.value.send(JSON.stringify(message));
}

const submitResponse = (answer: string) => {
  const message = { type: 'submit-answer', content: {roomCode: roomCode.value, answer: answer, playerId: userId.value}}
  socket.value.send(JSON.stringify(message))
}

const readyUp = () => {
  const message = { type: 'ready-up', content: {roomCode: roomCode.value, playerId: userId.value}}
  socket.value.send(JSON.stringify(message))
}

// Connect to the WebSocket when the component is mounted
onMounted(() => {
  connect();
});

// Close the WebSocket connection when the component is unmounted
onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close();
  }
});
</script>

<template>
  <h1>{{roomCode}}</h1>
  <div v-if="status === GameStatus.Pregame">
    <input placeholder="Username" v-model="username"/>
    <input placeholder="Room Code" v-model="roomCodeInput"/>
    <button @click="createRoom()">Create Game</button>
    <button @click="joinRoom(roomCodeInput)">Join Room</button>
  </div>
  <div v-if="status === GameStatus.InLobby">
    <button @click="startGame()">Start Game</button>
  </div>
  <div v-if="status === GameStatus.Playing || status === GameStatus.BetweenRounds">
    <Timer :time="time" />
    <PlayerDisplay :players="gameData.playerData" />
  </div>
  <div v-if="status === GameStatus.Playing">
    <PromptBox :prompt="gameData.currentPrompt" @submit-answer="submitResponse" />
  </div>
  <div v-if="status === GameStatus.BetweenRounds">
    <button @click="readyUp()">Ready!</button>
  </div>
  <div id="message-box">
    <p v-for="message in messages">{{message}}</p>
  </div>
</template>

<style scoped>
#message-box {
  height: 200px;
  overflow-y: scroll;
}
</style>
