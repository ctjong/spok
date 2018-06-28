import io from 'socket.io-client';
import ViewModel from './view-model';
const ClientSocket = {};


//---------------------------------------------------------------------------
// MESSAGE ENUMS
// This should be kept in sync with the enums in server-socket
//---------------------------------------------------------------------------

ClientSocket.msg =
{
    types:
    {
        STATE_UPDATE: "stateUpdate",
        CREATE_ROOM: "createRoom",
        JOIN_ROOM_REQUEST: "joinRoomRequest",
        JOIN_ROOM_RESPONSE: "joinRoomResponse",
    },
    targets:
    {
        SERVER: "server",
        OTHERS: "others",
        ALL: "all",
    },
    events:
    {
        CONNECT: "connect",
        MSG: "message"
    },
    errors:
    {
        USER_NAME_EXISTS: "userNameExists",
    }
};


//-------------------------------------------
// PRIVATE VARIABLES
//-------------------------------------------

const hostOnlyMessages = 
[
    ClientSocket.msg.types.JOIN_ROOM_REQUEST
];

let socket = null;
let responseHandlers = {};


//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ClientSocket.sendToServer = (type, data, responseMsgType) => 
{
    return socketSend(type, ClientSocket.msg.targets.SERVER, null, data, responseMsgType);
};

ClientSocket.sendToId = (type, targetId, data, responseMsgType) => 
{
    return socketSend(type, targetId, null, data, responseMsgType);
};

ClientSocket.sendToCurrentRoom = (type, target, data, responseMsgType) => 
{
    return socketSend(type, target, ViewModel.getUserState(ViewModel.constants.ROOM_CODE), data, responseMsgType);
};

ClientSocket.getSocketId = () => 
{
    if(!socket)
        return null;
    return socket.id;
};


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const socketSend = (type, target, room, data, responseMsgType) => 
{
    return new Promise((resolve) => 
    {
        ensureInitialized().then(() => 
        {
            console.log("sending " + JSON.stringify({ type, target, room, data, source:socket.id }));
            if(responseMsgType)
            {
                if(!responseHandlers[responseMsgType])
                    responseHandlers[responseMsgType] = [];
            }
            const ack = responseMsgType ? null : (response => resolve(response));
            socket.emit(ClientSocket.msg.events.MSG, { type, target, room, data }, ack);
            if(responseMsgType)
                responseHandlers[responseMsgType].push(resolve);
        });
    });
};

const handleJoinRequest = (msg) => 
{
    if(!ViewModel.activeView.isRoomView)
        return;
    const player = ViewModel.gameState.players[msg.data.userName];
    const room = ViewModel.getUserState(ViewModel.constants.ROOM_CODE);
    if (player && !player.isOnline)
    {
        // the player was disconnected and is reconnecting. accept right away.
        player.isOnline = true;
        ClientSocket.sendToId(ClientSocket.msg.types.JOIN_ROOM_RESPONSE, msg.source, 
            { isSuccess: true, room, gameState: ViewModel.gameState });
        ViewModel.activeView.syncStates();

        //TODO
        // ViewModel.Views.ChatBox.Update(msg.data.userName + " has reconnected");
    }
    else if (player && player.isOnline)
    {
        // the chosen name already taken by someone else in the room
        ClientSocket.sendToId(ClientSocket.msg.types.JOIN_ROOM_RESPONSE, msg.source, 
            { isSuccess: false, err: ClientSocket.msg.errors.USER_NAME_EXISTS });
    }
    else
    {
        // valid name chosen, people are still in the lobby. send acceptance.
        ViewModel.gameState.players[msg.data.userName] = { userName: msg.data.userName, isOnline: true };
        ClientSocket.sendToId(ClientSocket.msg.types.JOIN_ROOM_RESPONSE, msg.source, 
            { isSuccess: true, room, gameState: ViewModel.gameState });
        ViewModel.activeView.syncStates();

        //TODO
        // ViewModel.Views.ChatBox.Update(msg.data.userName + " has joined");
    }
};

const handleMessage = (msg) => 
{
    console.log("received " + JSON.stringify(msg));
    if(hostOnlyMessages.indexOf(msg.type) >= 0 && !ViewModel.isHostUser())
    {
        console.log("ignoring messages for host");
        return;
    }
    switch(msg.type)
    {
        case ClientSocket.msg.types.JOIN_ROOM_REQUEST:
            handleJoinRequest(msg);
            break;
        case ClientSocket.msg.types.STATE_UPDATE:
            ViewModel.gameState = msg.data;
            ViewModel.activeView.syncStates();
            break;
    }
    while(responseHandlers[msg.type] && responseHandlers[msg.type].length > 0)
    {
        const resolve = responseHandlers[msg.type].pop();
        resolve(msg);
    }
};

const ensureInitialized = () =>
{
    return new Promise(resolve => 
    {
        if(socket)
        {
            resolve();
            return;
        }
        const origin = (window.location.origin.indexOf("localhost") >= 0) ? "http://localhost:1337" : window.location.origin;
        socket = io(origin);
        socket.on(ClientSocket.msg.events.CONNECT, () => 
        {
            socket.on(ClientSocket.msg.events.MSG, handleMessage);
            ViewModel.clientSocket = ClientSocket;
            resolve();
        });
    });
};

export default ClientSocket;

// const MessageHandlers = {};
// MessageHandlers["joinResponse"] = (message) =>
// {
//     if (!ViewModel.JoinRequest)
//         return;
//     if (message.response === "accepted")
//     {
//         ViewModel.SignalHub.JoinRoom(ViewModel.JoinRequest.roomCode, message.gameState.key, function ()
//         {
//             $("body").removeClass("host").addClass("nonHost");
//             ViewModel.RoomCode = ViewModel.JoinRequest.roomCode;
//             ViewModel.UserName = ViewModel.JoinRequest.userName;
//             ViewModel.gameState = $.extend({}, message.gameState);
//             var gameStatus = ViewModel.gameState.status;
//             if (gameStatus === 6)
//             {
//                 ViewModel.Controller.LoadPage(ViewModel.Views.RevealPage);
//             } else if (gameStatus > 0 && gameStatus < 6)
//             {
//                 if (!ViewModel.Controller.IsCurrentPhraseSubmitted())
//                 {
//                     ViewModel.Controller.LoadPage(ViewModel.Views.WritePage);
//                 } else
//                 {
//                     ViewModel.Controller.LoadPage(ViewModel.Views.PhraseSubmittedPage);
//                 }
//             } else
//             {
//                 ViewModel.Controller.LoadPage(ViewModel.Views.LobbyPage);
//             }
//         });
//         return;
//     }

//     if (ViewModel.ActivePage !== ViewModel.Views.JoinPage) ViewModel.Controller.LoadPage(ViewModel.Views.JoinPage);
//     if (message.response === "nameExists")
//     {
//         ViewModel.Views.JoinPage.ShowError("username already taken. please enter a different name");
//     } else if (message.response === "gameStarted")
//     {
//         ViewModel.Views.JoinPage.ShowError("a round has started in that room. please wait until they are back in the lobby or try another room.");
//     } else
//     {
//         ViewModel.Views.JoinPage.ShowError("an error occurred. please try a different room");
//     }
//     ViewModel.JoinRequest = null;
// };

// MessageHandlers["timeout"] = (message) =>
// {
//     console.log("timeout signal received");
//     var requestType = message.request.type;
//     if (requestType === "joinRequest")
//     {
//         if (ViewModel.ActivePage !== ViewModel.Views.JoinPage) ViewModel.Controller.LoadPage(ViewModel.Views.JoinPage);
//         ViewModel.Views.JoinPage.ShowError("request timed out. please try a different room");
//     }
// };

// MessageHandlers["playerJoined"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message)) return;
//     if (message.userName in ViewModel.gameState.players) return;
//     ViewModel.gameState.players[message.userName] = message.connectionId;
//     ViewModel.ActivePage.Refresh();
//     ViewModel.Views.ChatBox.Update(message.userName + " has joined");
//     ViewModel.Views.ParticipantsBox.Update();
// };

// MessageHandlers["startRound"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.gameState.lang = message.lang;
//     ViewModel.gameState.papers = $.extend({}, message.papers);
//     ViewModel.gameState.status = 1;
//     ViewModel.Controller.LoadPage(ViewModel.Views.WritePage);
// };

// MessageHandlers["phraseSubmitted"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     var paper = ViewModel.gameState.papers[message.paperId];
//     paper["phrase" + ViewModel.gameState.status] = message.value;
//     paper["phrase" + ViewModel.gameState.status + "author"] = paper.currentEditor;
//     if (ViewModel.Controller.GetCurrentUnsubmittedPlayers().length === 0)
//     {
//         ViewModel.Controller.StartNextPhrase();
//     } else if (ViewModel.ActivePage === ViewModel.Views.PhraseSubmittedPage)
//     {
//         ViewModel.ActivePage.Refresh();
//     }
// };

// MessageHandlers["nextPhrase"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.gameState.status++;
//     ViewModel.Controller.ApplyAssignments(message.assignments);
//     ViewModel.Controller.LoadPage(ViewModel.Views.WritePage);
// };

// MessageHandlers["reveal"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.gameState.status = 6;
//     ViewModel.Controller.ApplyAssignments(message.assignments);
//     ViewModel.Controller.LoadPage(ViewModel.Views.RevealPage);
// };

// MessageHandlers["endRound"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.gameState.status = 0;
//     ViewModel.gameState.papers = {};
//     ViewModel.Controller.LoadPage(ViewModel.Views.LobbyPage);
// };

// MessageHandlers["hostChanged"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.gameState.hostUserName = message.newHostUserName;
// };

// MessageHandlers["chat"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.Views.ChatBox.Update(message.content, message.author);
// };

// MessageHandlers["playerKicked"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.Controller.KickPlayer(message.userName);
// };