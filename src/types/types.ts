export enum GameStatus {
    Pregame,
    InLobby,
    Playing,
    Submitted,
    BetweenRounds
}

export interface GameData {
    round: int,
    currentPrompt: string,
    promptHistory: string[],
    status: string,
    playerData: PlayerData[]
}

export interface PlayerData {
    username: string,
    id: string,
    wordHistory: string[],
    letters: string[],
    status: string,
}