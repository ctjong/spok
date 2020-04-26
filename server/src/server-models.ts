import constants from "./server-constants";

export class Paper {
  id: string;
  parts: Part[];

  constructor(id: string) {
    this.id = id;
    this.parts = [];
  }
}

export class Player {
  userName: string;
  socketId: string;
  paperId: string;
  isOnline: boolean;
  score: number;

  constructor(userName: string, socketId: string) {
    this.userName = userName;
    this.socketId = socketId;
    this.paperId = null;
    this.isOnline = true;
    this.score = 0;
  }
}

export class Part {
  paperId: string;
  text: string;
  authorUserName: string;

  constructor(paperId: string, text: string, authorUserName: string) {
    this.paperId = paperId;
    this.text = text;
    this.authorUserName = authorUserName;
  }
}

export class Room {
  roomCode: string;
  lang: string;
  activePart: number;
  phase: number;
  players: { [key: string]: Player };
  papers: { [key: string]: Paper };
  hostUserName: string;

  constructor(
    roomCode: string,
    lang: string,
    hostUserName: string,
    hostSocket: { id: string }
  ) {
    this.roomCode = roomCode;
    this.lang = lang;
    this.activePart = -1;
    this.phase = constants.INITIAL_PHASE;
    this.players = {};
    this.papers = {};
    this.players[hostUserName] = new Player(hostUserName, hostSocket.id);
    this.hostUserName = hostUserName;
  }
}

//-----------------------------------------------------------
// MESSAGES
//-----------------------------------------------------------

export interface SpokMessage {
  type: number;
  roomCode: string;
}

export class RoomUpdateMessage implements SpokMessage {
  type: number;
  roomCode: string;
  newRoomState: Room;

  constructor(roomCode: string, newRoomState: Room) {
    this.type = constants.msgTypes.ROOM_UPDATE;
    this.roomCode = roomCode;
    this.newRoomState = newRoomState;
  }
}

export class CreateRoomMessage implements SpokMessage {
  type: number;
  roomCode: string;
  hostUserName: string;
  lang: string;
  players: { [key: string]: Player };
  papers: { [key: string]: Paper };

  constructor(roomCode: string, hostUserName: string, lang: string) {
    this.type = constants.msgTypes.CREATE_ROOM;
    this.roomCode = roomCode;
    this.hostUserName = hostUserName;
    this.lang = lang;
    this.players = {};
    this.papers = {};
  }
}

export class JoinRequestMessage implements SpokMessage {
  type: number;
  roomCode: string;
  userName: string;

  constructor(roomCode: string, userName: string) {
    this.type = constants.msgTypes.JOIN_REQUEST;
    this.roomCode = roomCode;
    this.userName = userName;
  }
}

export class SubmitPartMessage implements SpokMessage {
  type: number;
  roomCode: string;
  part: Part;

  constructor(roomCode: string, part: Part) {
    this.type = constants.msgTypes.SUBMIT_PART;
    this.roomCode = roomCode;
    this.part = part;
  }
}

export class ChatMessage implements SpokMessage {
  type: number;
  roomCode: string;
  authorUserName: string;
  text: string;

  constructor(roomCode: string, authorUserName: string, text: string) {
    this.type = constants.msgTypes.CHAT_MESSAGE;
    this.roomCode = roomCode;
    this.authorUserName = authorUserName;
    this.text = text;
  }
}

export class GoToLobbyMessage implements SpokMessage {
  type: number;
  roomCode: string;

  constructor(roomCode: string) {
    this.type = constants.msgTypes.GO_TO_LOBBY;
    this.roomCode = roomCode;
  }
}

export class KickPlayerMessage implements SpokMessage {
  type: number;
  roomCode: string;
  userName: string;

  constructor(roomCode: string, userName: string) {
    this.type = constants.msgTypes.KICK_PLAYER;
    this.roomCode = roomCode;
    this.userName = userName;
  }
}

export class SetAsHostMessage implements SpokMessage {
  type: number;
  roomCode: string;
  userName: string;

  constructor(roomCode: string, userName: string) {
    this.type = constants.msgTypes.SET_AS_HOST;
    this.roomCode = roomCode;
    this.userName = userName;
  }
}

export class StartRoundMessage implements SpokMessage {
  type: number;
  roomCode: string;

  constructor(roomCode: string) {
    this.type = constants.msgTypes.START_ROUND;
    this.roomCode = roomCode;
  }
}

export class ScoreUpdateMessage implements SpokMessage {
  type: number;
  roomCode: string;
  paperId: string;
  delta: number;

  constructor(roomCode: string, paperId: string, delta: number) {
    this.type = constants.msgTypes.SCORE_UPDATE;
    this.roomCode = roomCode;
    this.paperId = paperId;
    this.delta = delta;
  }
}

export class StateRequestMessage implements SpokMessage {
  type: number;
  roomCode: string;
  userName: string;

  constructor(roomCode: string, userName: string) {
    this.type = constants.msgTypes.STATE_REQUEST;
    this.roomCode = roomCode;
    this.userName = userName;
  }
}

//-----------------------------------------------------------
// RESPONSES
//-----------------------------------------------------------

export interface SpokResponse {
  isSuccess: boolean;
}

export class RoomJoinedResponse implements SpokResponse {
  isSuccess: boolean;
  roomState: Room;

  constructor(roomState: Room) {
    this.isSuccess = true;
    this.roomState = roomState;
  }
}

export class ErrorResponse implements SpokResponse {
  isSuccess: boolean;
  notifCode: string;

  constructor(notifCode: string) {
    this.isSuccess = false;
    this.notifCode = notifCode;
  }
}

export class SuccessResponse implements SpokResponse {
  isSuccess: boolean;

  constructor() {
    this.isSuccess = true;
  }
}

export class StateResponse implements SpokResponse {
  isSuccess: boolean;
  state: Room;

  constructor(state: Room) {
    this.isSuccess = true;
    this.state = state;
  }
}
