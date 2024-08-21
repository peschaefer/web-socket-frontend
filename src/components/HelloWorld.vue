<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import Player from "./Player.vue";

enum GameStatus {
  Pregame,
  InLobby,
  Playing,
  Submitted,
  BetweenRounds
}

interface GameData {
  round: int,
  currentPrompt: string,
  promptHistory: string[],
  status: string,
  playerData: PlayerData[]
}

interface PlayerData {
  username: string,
  id: string,
  wordHistory: string[],
  letters: string[],
  status: string,
}

const socket = ref<WebSocket | null>(null);
const time = ref(null)
const userId = ref(null)
const messages = ref<{ message: string }[]>([]);
const roomCode = ref('');
const roomCodeInput = ref('');
const username = ref('');
const status = ref<GameStatus>(GameStatus.Pregame);
const answer = ref('')
const gameData = ref<GameData>(null)
const playerData = ref<PlayerData[]>(null)

// Function to connect to the WebSocket server
const connect = () => {
  socket.value = new WebSocket('ws://localhost:8080/ws');

  socket.value.onopen = () => {
    console.log('Connected to WebSocket');
  };

  socket.value.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    console.log(data.type)
    messages.value.push(data);

    switch(data.type){
      case "game-created":
        roomCode.value = data.content.room_code;
        console.log(roomCode.value);
        joinRoom(roomCode.value);
        return
      case "joined-game":
        status.value = GameStatus.InLobby;
        userId.value = data.content.user_id;
        roomCode.value = data.content.room_code;
        return
      case "countdown":
        time.value = data.content.time_remaining;
        return
      case "game-started":
      case "round-started":
        status.value = GameStatus.Playing;
        gameData.value = data.content;
        playerData.value = data.content.player_data;
        console.log(playerData.value);
        console.log(gameData.value);
        return
      case "post-round-adjustment":
      case "game-updated":
        console.log(data.type)
        gameData.value = data.content;
        playerData.value = data.content.player_data;
        console.log(playerData.value);
        console.log(gameData.value);
        return
      case "round-completed":
        status.value = GameStatus.BetweenRounds;
        gameData.value = data.content;
        playerData.value = data.content.player_data;
        console.log(playerData.value);
        console.log(gameData.value);
        return
      case "answer-accepted":
        status.value = GameStatus.Submitted;
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
  console.log(message);
  socket.value.send(JSON.stringify(message));
}

const joinRoom = (roomCode) => {
  const message = { type: 'join-game', content: {room_code: roomCode, username: username.value} };
  console.log(message);
  socket.value.send(JSON.stringify(message));
}

const startGame = () => {
  const message = { type: 'start-game', content: {room_code: roomCode.value, username: username.value} };
  console.log(message);
  socket.value.send(JSON.stringify(message));
}

const submitResponse = () => {
  const message = { type: 'submit-answer', content: {room_code: roomCode.value, answer: answer.value, player_id: userId.value}}
  socket.value.send(JSON.stringify(message))
}

const readyUp = () => {
  const message = { type: 'ready-up', content: {room_code: roomCode.value, player_id: userId.value}}
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
  <h3>{{time}}</h3>
  <div v-if="status === GameStatus.Pregame">
    <input placeholder="Username" v-model="username"/>
    <input placeholder="Room Code" v-model="roomCodeInput"/>
    <button @click="createRoom()">Create Game</button>
    <button @click="joinRoom(roomCodeInput)">Join Room</button>
  </div>
  <div v-if="status === GameStatus.InLobby">
    <button @click="startGame()">Start Game</button>
  </div>
  <div v-if="status === GameStatus.Playing">
    <div class="players">
      <player v-for="player in playerData" :username="player.username"  :status="player.status" />
    </div>
    <input placeholder="Type your Response!" v-model="answer"/>
    <button @click="submitResponse()">Submit Answer</button>
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
