import { Socket } from "socket.io";
import {
  Message,
  Room,
  ErrorResponse,
  CreateRoomMessage,
  SuccessResponse,
  JoinRequestMessage,
  Player,
  JoinApprovedResponse,
  SubmitPartMessage,
  GoToLobbyMessage,
  KickPlayerMessage,
  SetAsHostMessage,
  StartRoundMessage,
  ScoreUpdateMessage,
  StateRequestMessage,
  ChatMessage,
  Paper,
  StateResponse,
  RoomUpdateMessage
} from "src/models";
import Constants from "../constants";
import { Http2Server } from "http2";

let io = null;
const rooms: { [key: string]: Room } = {};
const socketToRoomMap: { [key: string]: string } = {};

//--------------------------------------------------------------------------
// EVENT HANDLERS
//--------------------------------------------------------------------------

const handleMessage = (
  socket: Socket,
  msg: Message,
  reply: (res: any) => void
) => {
  console.log(`received ${msg.type} from ${socket.id}`);
  if (msg.type !== Constants.msgTypes.CREATE_ROOM && !rooms[msg.roomCode]) {
    console.log(
      `sending ErrorResponse ${Constants.notifCodes.ROOM_NOT_EXIST} to ${
        socket.id
      }`
    );
    reply(new ErrorResponse(Constants.notifCodes.ROOM_NOT_EXIST));
    return;
  }

  switch (msg.type) {
    case Constants.msgTypes.CREATE_ROOM:
      handleCreateRoom(socket, msg as CreateRoomMessage, reply);
      break;
    case Constants.msgTypes.JOIN_REQUEST:
      handleJoinRequest(socket, msg as JoinRequestMessage, reply);
      break;
    case Constants.msgTypes.SUBMIT_PART:
      handleSubmitPart(socket, msg as SubmitPartMessage, reply);
      break;
    case Constants.msgTypes.GO_TO_LOBBY:
      handleGoToLobby(socket, msg as GoToLobbyMessage, reply);
      break;
    case Constants.msgTypes.KICK_PLAYER:
      handleKickPlayer(socket, msg as KickPlayerMessage, reply);
      break;
    case Constants.msgTypes.SET_AS_HOST:
      handleSetAsHost(socket, msg as SetAsHostMessage, reply);
      break;
    case Constants.msgTypes.START_ROUND:
      handleStartRound(socket, msg as StartRoundMessage, reply);
      break;
    case Constants.msgTypes.SCORE_UPDATE:
      handleScoreUpdate(socket, msg as ScoreUpdateMessage, reply);
      break;
    case Constants.msgTypes.STATE_REQUEST:
      handleStateRequest(socket, msg as StateRequestMessage, reply);
      break;
    case Constants.msgTypes.CHAT_MESSAGE:
      handleChatMessage(socket, msg as ChatMessage, reply);
      break;
    default:
      break;
  }
};

const handleDisconnect = (socket: Socket) => {
  console.log("received DISCONNECT from " + socket.id);
  const roomCode = socketToRoomMap[socket.id];
  const room = rooms[roomCode];
  if (!roomCode || !room) {
    console.log(`room not found for socket ${socket.id} (code: ${roomCode})`);
    return;
  }

  const dcSocketId = socket.id;
  const dcPlayer = getPlayerBySocketId(room, dcSocketId);
  if (dcPlayer) {
    dcPlayer.isOnline = false;
    broadcastSystemChat(socket, room, `${dcPlayer.userName} has disconnected`);
    broadcastStateUpdate(socket, room);
  }
  destroyRoomIfUnused(roomCode);
};

const handleReconnect = (socket: Socket) => {
  console.log("received RECONNECT from " + socket.id);
  const roomCode = socketToRoomMap[socket.id];
  const room = rooms[roomCode];
  if (!roomCode || !room) return;

  const rcSocketId = socket.id;
  const rcPlayer = getPlayerBySocketId(room, rcSocketId);
  if (rcPlayer) {
    rcPlayer.isOnline = true;
    broadcastSystemChat(socket, room, `${rcPlayer.userName} has reconnected`);
    broadcastStateUpdate(socket, room);
  }
};

//--------------------------------------------------------------------------
// MESSAGE EVENT HANDLERS
//--------------------------------------------------------------------------

const handleCreateRoom = (
  socket: Socket,
  msg: CreateRoomMessage,
  reply: (res: any) => void
) => {
  const roomCode = msg.roomCode;
  socketToRoomMap[socket.id] = roomCode;
  rooms[roomCode] = new Room(roomCode, msg.lang, msg.hostUserName, socket);
  socket.join(roomCode, () => {
    console.log(`room ${roomCode} created`);
    console.log(`sending SuccessResponse to ${socket.id}`);
    reply(new SuccessResponse());
  });
};

const handleJoinRequest = (
  socket: Socket,
  msg: JoinRequestMessage,
  reply: (res: any) => void
) => {
  const roomCode = msg.roomCode;
  const room = rooms[roomCode];

  // if round is currently ongoing and the request is not for reconnection, reject it.
  const existingPlayer = room.players[msg.userName];
  if (!existingPlayer && room.phase > Constants.phases.LOBBY) {
    console.log(
      `sending ErrorResponse ${Constants.notifCodes.ROUND_ONGOING} to ${
        socket.id
      }`
    );
    reply(new ErrorResponse(Constants.notifCodes.ROUND_ONGOING));
    return;
  }
  const newPlayer = new Player(msg.userName, socket.id);

  // accept the request if:
  // - the chosen name is already present in the room (reconnect attempt), OR
  // - people are in the lobby
  socket.join(roomCode, () => {
    if (existingPlayer) {
      delete socketToRoomMap[existingPlayer.socketId];
      socketToRoomMap[newPlayer.socketId] = roomCode;
      existingPlayer.isOnline = true;
      existingPlayer.socketId = newPlayer.socketId;
      broadcastSystemChat(
        socket,
        room,
        `${existingPlayer.userName} has reconnected`
      );
    } else {
      socketToRoomMap[newPlayer.socketId] = roomCode;
      room.players[newPlayer.userName] = newPlayer;
      broadcastSystemChat(socket, room, `${newPlayer.userName} has joined`);
    }

    console.log(`sending JoinApprovedResponse to ${socket.id}`);
    reply(new JoinApprovedResponse(room));
    broadcastStateUpdate(socket, room);
  });
};

const handleSubmitPart = (
  socket: Socket,
  msg: SubmitPartMessage,
  reply: (res: any) => void
) => {
  const part = msg.part;
  const roomCode = msg.roomCode;
  const room = rooms[roomCode];
  const paper = room.papers[part.paperId];
  if (!paper) {
    console.log(
      `sending ErrorResponse ${Constants.notifCodes.SUBMIT_PART_FAILED} to ${
        socket.id
      }`
    );
    reply(new ErrorResponse(Constants.notifCodes.SUBMIT_PART_FAILED));
    return;
  }
  paper.parts[room.activePart] = part;
  console.log(`sending SuccessResponse to ${socket.id}`);
  reply(new SuccessResponse());
  updateWritePhaseState(room);
  broadcastStateUpdate(socket, room);
};

const handleGoToLobby = (
  socket: Socket,
  msg: GoToLobbyMessage,
  reply: (res: any) => void
) => {
  const roomCode = msg.roomCode;
  const room = rooms[roomCode];
  room.phase = Constants.phases.LOBBY;
  console.log(`sending SuccessResponse to ${socket.id}`);
  reply(new SuccessResponse());
  broadcastStateUpdate(socket, room);
};

const handleKickPlayer = (
  socket: Socket,
  msg: KickPlayerMessage,
  reply: (res: any) => void
) => {
  const roomCode = msg.roomCode;
  const room = rooms[roomCode];
  const userName = msg.userName;
  if (room.players[userName]) {
    delete room.players[userName];
    if (room.phase === Constants.phases.WRITE) updateWritePhaseState(room);
    broadcastSystemChat(socket, room, `${userName} has been kicked`);
    broadcastStateUpdate(socket, room);
  }
  console.log(`sending SuccessResponse to ${socket.id}`);
  reply(new SuccessResponse());
};

const handleSetAsHost = (
  socket: Socket,
  msg: SetAsHostMessage,
  reply: (res: any) => void
) => {
  const roomCode = msg.roomCode;
  const room = rooms[roomCode];
  const userName = msg.userName;
  room.hostUserName = userName;
  console.log(`sending SuccessResponse to ${socket.id}`);
  reply(new SuccessResponse());
  broadcastSystemChat(socket, room, `${userName} has been set as host`);
  broadcastStateUpdate(socket, room);
};

const handleStartRound = (
  socket: Socket,
  msg: StartRoundMessage,
  reply: (res: any) => void
) => {
  const roomCode = msg.roomCode;
  const room = rooms[roomCode];
  room.phase = Constants.phases.WRITE;
  room.activePart = 0;
  room.papers = {};
  Object.keys(room.players).forEach(userName => {
    const paper = new Paper(getRandomCode());
    const player = room.players[userName];
    player.paperId = paper.id;
    room.papers[paper.id] = paper;
  });
  console.log(`sending SuccessResponse to ${socket.id}`);
  reply(new SuccessResponse());
  broadcastStateUpdate(socket, room);
};

const handleScoreUpdate = (
  socket: Socket,
  msg: ScoreUpdateMessage,
  reply: (res: any) => void
) => {
  const roomCode = msg.roomCode;
  const room = rooms[roomCode];
  const paper = room.papers[msg.paperId];
  if (!paper) {
    console.log(
      `sending ErrorResponse ${Constants.notifCodes.UNKNOWN_ERROR} to ${
        socket.id
      }`
    );
    reply(new ErrorResponse(Constants.notifCodes.UNKNOWN_ERROR));
    return;
  }
  paper.parts.forEach(part => {
    if (part.authorUserName === null) return;
    const player = room.players[part.authorUserName];
    player.score += msg.delta;
  });
  console.log(`sending SuccessResponse to ${socket.id}`);
  reply(new SuccessResponse());
  broadcastStateUpdate(socket, room);
};

const handleChatMessage = (
  socket: Socket,
  msg: ChatMessage,
  reply: (res: any) => void
) => {
  console.log(`sending SuccessResponse to ${socket.id}`);
  reply(new SuccessResponse());
  broadcast(socket, msg);
};

const handleStateRequest = (
  socket: Socket,
  msg: StateRequestMessage,
  reply: (res: any) => void
) => {
  const roomCode = msg.roomCode;
  const room = rooms[roomCode];
  const userName = msg.userName;
  const player = room.players[userName];
  if (!player) {
    console.log(
      `sending ErrorResponse ${Constants.notifCodes.NOT_IN_ROOM} to ${
        socket.id
      }`
    );
    reply(new ErrorResponse(Constants.notifCodes.NOT_IN_ROOM));
    return;
  }
  if (player.socketId !== socket.id) {
    socket.join(roomCode);
    room.players[userName].socketId = socket.id;
    broadcastStateUpdate(socket, room);
  } else if (!player.isOnline) {
    player.isOnline = true;
    broadcastStateUpdate(socket, room);
  }
  console.log("sending StateResponse to " + socket.id);
  reply(new StateResponse(room));
};

//--------------------------------------------------------------------------
// HELPER FUNCTIONS
//--------------------------------------------------------------------------

const broadcast = (socket: Socket, msg: Message) => {
  console.log(`sending ${msg.type} to ${msg.roomCode}`);
  socket.to(msg.roomCode).emit(Constants.eventNames.MSG, msg);
  socket.emit(Constants.eventNames.MSG, msg);
};

const broadcastStateUpdate = (socket: Socket, room: Room) => {
  broadcast(socket, new RoomUpdateMessage(room.roomCode, room));
};

const broadcastSystemChat = (socket: Socket, room: Room, text: string) => {
  broadcast(socket, new ChatMessage(room.roomCode, null, text));
};

const updateWritePhaseState = (room: Room) => {
  let readyToProceed = true;
  Object.keys(room.players).forEach(userName => {
    const paperId = room.players[userName].paperId;
    const paper = room.papers[paperId];
    if (paper && !paper.parts[room.activePart]) readyToProceed = false;
  });

  if (readyToProceed) {
    if (room.activePart >= Constants.TOTAL_PARTS - 1)
      room.phase = Constants.phases.REVEAL;
    else {
      movePapers(room);
      room.activePart++;
    }
  }
};

const movePapers = (room: Room) => {
  const players = room.players;
  const userNames = Object.keys(players);
  userNames.sort();

  const firstPaperId = players[userNames[0]].paperId;
  userNames.forEach((userName, index) => {
    players[userName].paperId =
      index < userNames.length - 1
        ? players[userNames[index + 1]].paperId
        : firstPaperId;
  });
};

const getPlayerBySocketId = (room: Room, socketId: string): Player => {
  let player = null;
  Object.keys(room.players).some(userName => {
    if (room.players[userName].socketId === socketId) {
      player = room.players[userName];
      return true;
    }
    return false;
  });
  return player;
};

const destroyRoomIfUnused = (roomCode: string) => {
  const room = rooms[roomCode];
  if (!room) return;
  let numOnline = 0;
  Object.keys(room.players).forEach(userName => {
    if (room.players[userName].isOnline) numOnline++;
  });
  console.log(`remaining online players in room ${roomCode}: ${numOnline}`);
  if (numOnline === 0) {
    // if there is no more active socket in the room, destroy the room
    console.log(`destroying room ${roomCode}`);
    Object.keys(room.players).forEach(userName => {
      const socketId = room.players[userName].socketId;
      delete socketToRoomMap[socketId];
    });
    delete rooms[roomCode];
    return;
  }
};

const getRandomCode = () => {
  return Math.floor((1 + Math.random()) * 0x1000000000).toString(16);
};

//--------------------------------------------------------------------------
// ENTRY POINT
//--------------------------------------------------------------------------

export default {
  initialize: (http: Http2Server) => {
    io = require("socket.io")(http);
    io.on("connection", (socket: Socket) => {
      socket.on(
        Constants.eventNames.MSG,
        (msg: Message, reply: (res: any) => void) =>
          handleMessage(socket, msg, reply)
      );
      socket.on(Constants.eventNames.DISCONNECT, () =>
        handleDisconnect(socket)
      );
      socket.on(Constants.eventNames.RECONNECT, () => handleReconnect(socket));
    });
  }
};
