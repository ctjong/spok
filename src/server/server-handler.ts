import { Socket } from "socket.io";
import {
  SpokMessage,
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
} from "../models";
import constants from "../constants";
import { Http2Server } from "http2";
import { Part } from "models";
import util from "../util";

class ServerHandler {
  io: Socket = null;
  rooms: { [key: string]: Room } = {};
  socketToRoomMap: { [key: string]: string } = {};

  //--------------------------------------------------------------------------
  // ENTRY POINT
  //--------------------------------------------------------------------------

  initialize(http: Http2Server) {
    this.io = require("socket.io")(http);
    this.io.on("connection", (socket: Socket) => {
      socket.on(
        constants.eventNames.MSG,
        (msg: SpokMessage, reply: (res: any) => void) =>
          this.handleMessage(socket, msg, reply)
      );
      socket.on(constants.eventNames.DISCONNECT, () =>
        this.handleDisconnect(socket)
      );
      socket.on(constants.eventNames.RECONNECT, () =>
        this.handleReconnect(socket)
      );
    });
  }

  //--------------------------------------------------------------------------
  // EVENT HANDLERS
  //--------------------------------------------------------------------------

  handleMessage = (
    socket: Socket,
    msg: SpokMessage,
    reply: (res: any) => void
  ) => {
    console.log(`received from ${socket.id}`, msg);

    if (!msg.roomCode) {
      console.log(
        `sending ErrorResponse ${constants.notifCodes.INVALID_ARGUMENT} to ${
          socket.id
        }`
      );
      reply(new ErrorResponse(constants.notifCodes.INVALID_ARGUMENT));
      return;
    }

    if (
      msg.type !== constants.msgTypes.CREATE_ROOM &&
      !this.rooms[msg.roomCode]
    ) {
      console.log(
        `sending ErrorResponse ${constants.notifCodes.ROOM_NOT_EXIST} to ${
          socket.id
        }`
      );
      reply(new ErrorResponse(constants.notifCodes.ROOM_NOT_EXIST));
      return;
    }

    switch (msg.type) {
      case constants.msgTypes.CREATE_ROOM:
        this.handleCreateRoom(socket, msg as CreateRoomMessage, reply);
        break;
      case constants.msgTypes.JOIN_REQUEST:
        this.handleJoinRequest(socket, msg as JoinRequestMessage, reply);
        break;
      case constants.msgTypes.SUBMIT_PART:
        this.handleSubmitPart(socket, msg as SubmitPartMessage, reply);
        break;
      case constants.msgTypes.GO_TO_LOBBY:
        this.handleGoToLobby(socket, msg as GoToLobbyMessage, reply);
        break;
      case constants.msgTypes.KICK_PLAYER:
        this.handleKickPlayer(socket, msg as KickPlayerMessage, reply);
        break;
      case constants.msgTypes.SET_AS_HOST:
        this.handleSetAsHost(socket, msg as SetAsHostMessage, reply);
        break;
      case constants.msgTypes.START_ROUND:
        this.handleStartRound(socket, msg as StartRoundMessage, reply);
        break;
      case constants.msgTypes.SCORE_UPDATE:
        this.handleScoreUpdate(socket, msg as ScoreUpdateMessage, reply);
        break;
      case constants.msgTypes.STATE_REQUEST:
        this.handleStateRequest(socket, msg as StateRequestMessage, reply);
        break;
      case constants.msgTypes.CHAT_MESSAGE:
        this.handleChatMessage(socket, msg as ChatMessage, reply);
        break;
      default:
        break;
    }
  };

  handleDisconnect(socket: Socket) {
    console.log("received DISCONNECT from " + socket.id);
    const roomCode = this.socketToRoomMap[socket.id];
    const room = this.rooms[roomCode];
    if (!roomCode || !room) {
      console.log(`room not found for socket ${socket.id} (code: ${roomCode})`);
      return;
    }

    const dcSocketId = socket.id;
    const dcPlayer = this.getPlayerBySocketId(room, dcSocketId);
    if (dcPlayer) {
      dcPlayer.isOnline = false;
      this.broadcastSystemChat(
        socket,
        room,
        `${dcPlayer.userName} has disconnected`
      );
      this.broadcastStateUpdate(socket, room);
    }
    this.destroyRoomIfUnused(roomCode);
  }

  handleReconnect(socket: Socket) {
    console.log("received RECONNECT from " + socket.id);
    const roomCode = this.socketToRoomMap[socket.id];
    const room = this.rooms[roomCode];
    if (!roomCode || !room) return;

    const rcSocketId = socket.id;
    const rcPlayer = this.getPlayerBySocketId(room, rcSocketId);
    if (rcPlayer) {
      rcPlayer.isOnline = true;
      this.broadcastSystemChat(
        socket,
        room,
        `${rcPlayer.userName} has reconnected`
      );
      this.broadcastStateUpdate(socket, room);
    }
  }

  //--------------------------------------------------------------------------
  // MESSAGE EVENT HANDLERS
  //--------------------------------------------------------------------------

  handleCreateRoom = (
    socket: Socket,
    msg: CreateRoomMessage,
    reply: (res: any) => void
  ) => {
    const roomCode = msg.roomCode;
    this.socketToRoomMap[socket.id] = roomCode;
    this.rooms[roomCode] = new Room(
      roomCode,
      msg.lang,
      msg.hostUserName,
      socket
    );
    socket.join(roomCode, () => {
      console.log(`room ${roomCode} created`);
      console.log(`sending SuccessResponse to ${socket.id}`);
      reply(new SuccessResponse());
    });
  };

  handleJoinRequest = (
    socket: Socket,
    msg: JoinRequestMessage,
    reply: (res: any) => void
  ) => {
    const roomCode = msg.roomCode;
    const room = this.rooms[roomCode];

    // if round is currently ongoing and the request is not for reconnection, reject it.
    const existingPlayer = room.players[msg.userName];
    if (!existingPlayer && room.phase > constants.phases.LOBBY) {
      console.log(
        `sending ErrorResponse ${constants.notifCodes.ROUND_ONGOING} to ${
          socket.id
        }`
      );
      reply(new ErrorResponse(constants.notifCodes.ROUND_ONGOING));
      return;
    }

    // accept the request if:
    // - the chosen name is already present in the room (reconnect attempt), OR
    // - people are in the lobby
    socket.join(roomCode, () => {
      if (existingPlayer) {
        delete this.socketToRoomMap[existingPlayer.socketId];
        this.socketToRoomMap[socket.id] = roomCode;
        existingPlayer.isOnline = true;
        existingPlayer.socketId = socket.id;
        this.broadcastSystemChat(
          socket,
          room,
          `${existingPlayer.userName} has reconnected`
        );
      } else {
        this.socketToRoomMap[socket.id] = roomCode;
        room.players[msg.userName] = new Player(msg.userName, socket.id);
        this.broadcastSystemChat(socket, room, `${msg.userName} has joined`);
      }

      console.log(`sending JoinApprovedResponse to ${socket.id}`);
      reply(new JoinApprovedResponse(room));
      this.broadcastStateUpdate(socket, room);
    });
  };

  handleSubmitPart = (
    socket: Socket,
    msg: SubmitPartMessage,
    reply: (res: any) => void
  ) => {
    const part = msg.part;
    const roomCode = msg.roomCode;
    const room = this.rooms[roomCode];
    const paper = room.papers[part.paperId];
    if (!paper) {
      console.log(
        `sending ErrorResponse ${constants.notifCodes.SUBMIT_PART_FAILED} to ${
          socket.id
        }`
      );
      reply(new ErrorResponse(constants.notifCodes.SUBMIT_PART_FAILED));
      return;
    }
    paper.parts[room.activePart] = part;
    console.log(`sending SuccessResponse to ${socket.id}`);
    reply(new SuccessResponse());
    this.updateWritePhaseState(room);
    this.broadcastStateUpdate(socket, room);
  };

  handleGoToLobby = (
    socket: Socket,
    msg: GoToLobbyMessage,
    reply: (res: any) => void
  ) => {
    const roomCode = msg.roomCode;
    const room = this.rooms[roomCode];
    room.phase = constants.phases.LOBBY;
    console.log(`sending SuccessResponse to ${socket.id}`);
    reply(new SuccessResponse());
    this.broadcastStateUpdate(socket, room);
  };

  handleKickPlayer = (
    socket: Socket,
    msg: KickPlayerMessage,
    reply: (res: any) => void
  ) => {
    const roomCode = msg.roomCode;
    const room = this.rooms[roomCode];
    const userName = msg.userName;
    if (room.players[userName]) {
      delete room.players[userName];
      if (room.phase === constants.phases.WRITE)
        this.updateWritePhaseState(room);
      this.broadcastSystemChat(socket, room, `${userName} has been kicked`);
      this.broadcastStateUpdate(socket, room);
    }
    console.log(`sending SuccessResponse to ${socket.id}`);
    reply(new SuccessResponse());
  };

  handleSetAsHost = (
    socket: Socket,
    msg: SetAsHostMessage,
    reply: (res: any) => void
  ) => {
    const roomCode = msg.roomCode;
    const room = this.rooms[roomCode];
    const userName = msg.userName;
    room.hostUserName = userName;
    console.log(`sending SuccessResponse to ${socket.id}`);
    reply(new SuccessResponse());
    this.broadcastSystemChat(socket, room, `${userName} has been set as host`);
    this.broadcastStateUpdate(socket, room);
  };

  handleStartRound = (
    socket: Socket,
    msg: StartRoundMessage,
    reply: (res: any) => void
  ) => {
    const roomCode = msg.roomCode;
    const room = this.rooms[roomCode];
    room.phase = constants.phases.WRITE;
    room.activePart = 0;
    room.papers = {};
    Object.keys(room.players).forEach(userName => {
      const paper = new Paper(util.getRandomCode());
      const player = room.players[userName];
      player.paperId = paper.id;
      room.papers[paper.id] = paper;
    });
    console.log(`sending SuccessResponse to ${socket.id}`);
    reply(new SuccessResponse());
    this.broadcastStateUpdate(socket, room);
  };

  handleScoreUpdate = (
    socket: Socket,
    msg: ScoreUpdateMessage,
    reply: (res: any) => void
  ) => {
    const roomCode = msg.roomCode;
    const room = this.rooms[roomCode];
    const paper = room.papers[msg.paperId];
    if (!paper) {
      console.log(
        `sending ErrorResponse ${constants.notifCodes.UNKNOWN_ERROR} to ${
          socket.id
        }`
      );
      reply(new ErrorResponse(constants.notifCodes.UNKNOWN_ERROR));
      return;
    }
    paper.parts.forEach((part: Part) => {
      if (part.authorUserName === null) return;
      const player = room.players[part.authorUserName];
      player.score += msg.delta;
    });
    console.log(`sending SuccessResponse to ${socket.id}`);
    reply(new SuccessResponse());
    this.broadcastStateUpdate(socket, room);
  };

  handleChatMessage = (
    socket: Socket,
    msg: ChatMessage,
    reply: (res: any) => void
  ) => {
    console.log(`sending SuccessResponse to ${socket.id}`);
    reply(new SuccessResponse());
    this.broadcast(socket, msg);
  };

  handleStateRequest = (
    socket: Socket,
    msg: StateRequestMessage,
    reply: (res: any) => void
  ) => {
    const roomCode = msg.roomCode;
    const room = this.rooms[roomCode];
    const userName = msg.userName;
    const player = room.players[userName];
    if (!player) {
      console.log(
        `sending ErrorResponse ${constants.notifCodes.NOT_IN_ROOM} to ${
          socket.id
        }`
      );
      reply(new ErrorResponse(constants.notifCodes.NOT_IN_ROOM));
      return;
    }
    if (player.socketId !== socket.id) {
      socket.join(roomCode);
      room.players[userName].socketId = socket.id;
      this.broadcastStateUpdate(socket, room);
    } else if (!player.isOnline) {
      player.isOnline = true;
      this.broadcastStateUpdate(socket, room);
    }
    console.log("sending StateResponse to " + socket.id);
    reply(new StateResponse(room));
  };

  //--------------------------------------------------------------------------
  // HELPER FUNCTIONS
  //--------------------------------------------------------------------------

  broadcast(socket: Socket, msg: SpokMessage) {
    console.log(`sending ${msg.type} to ${msg.roomCode}`);
    socket.to(msg.roomCode).emit(constants.eventNames.MSG, msg);
    socket.emit(constants.eventNames.MSG, msg);
  }

  broadcastStateUpdate(socket: Socket, room: Room) {
    this.broadcast(socket, new RoomUpdateMessage(room.roomCode, room));
  }

  broadcastSystemChat(socket: Socket, room: Room, text: string) {
    this.broadcast(socket, new ChatMessage(room.roomCode, null, text));
  }

  updateWritePhaseState(room: Room) {
    let readyToProceed = true;
    Object.keys(room.players).forEach(userName => {
      const paperId = room.players[userName].paperId;
      const paper = room.papers[paperId];
      if (paper && !paper.parts[room.activePart]) readyToProceed = false;
    });

    if (readyToProceed) {
      if (room.activePart >= constants.TOTAL_PARTS - 1)
        room.phase = constants.phases.REVEAL;
      else {
        this.movePapers(room);
        room.activePart++;
      }
    }
  }

  movePapers(room: Room) {
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
  }

  getPlayerBySocketId(room: Room, socketId: string): Player {
    let player = null;
    Object.keys(room.players).some(userName => {
      if (room.players[userName].socketId === socketId) {
        player = room.players[userName];
        return true;
      }
      return false;
    });
    return player;
  }

  destroyRoomIfUnused(roomCode: string) {
    const room = this.rooms[roomCode];
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
        delete this.socketToRoomMap[socketId];
      });
      delete this.rooms[roomCode];
      return;
    }
  }
}

export default new ServerHandler();
