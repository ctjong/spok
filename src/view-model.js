import $ from 'jquery';
import io from 'socket.io-client';
import msgHandler from './services/host-message-handler';

const ViewModel = {};
ViewModel.activeView = null;
ViewModel.history = null;
ViewModel.isHostUser = false;
ViewModel.gameState = null;

ViewModel.phases =
    {
        LOBBY: 1,
        WRITE: 2,
        REVEAL: 3
    };

ViewModel.constants =
    {
        WRITE_STAGE_COUNT: 4,
        ROOM_CODE: "roomCode",
        USER_NAME: "userName",
    };

let socket = null;


//---------------------------------------------------------------------------
// MESSAGE ENUMS
// This should be kept in sync with the enums in server-message-handler
//---------------------------------------------------------------------------

ViewModel.msg =
{
    types:
    {
        STATE_UPDATE: "stateUpdate",
        CREATE_ROOM: "createRoom",
        JOIN_ROOM: "joinRoom",
    },
    targets:
    {
        SERVER: "server",
        HOST: "host",
        OTHERS: "others",
        ALL: "all",
    },
    events:
    {
        MSG: "message"
    },
    errors:
    {
        ROOM_CODE_USED: "roomCodeUsed",
        USER_NAME_EXISTS: "userNameExists",
    }
};

//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ViewModel.getUserState = (name) => 
{
    return sessionStorage.getItem(name);
};

ViewModel.setUserState = (name, value) => 
{
    sessionStorage.setItem(name, value);
};

ViewModel.sendToServer = (type, data) => 
{
    return ViewModel.socketSend(type, ViewModel.msg.targets.SERVER, null, data);
};

ViewModel.sendToRoom = (type, target, data) => 
{
    return ViewModel.socketSend(type, target, ViewModel.getUserState(ViewModel.constants.ROOM_CODE), data);
};

ViewModel.socketSend = (type, target, room, data) => 
{
    ensureSocketInit();
    return new Promise((resolve, reject) => 
    {
        socket.emit(ViewModel.msg.events.MSG, { type, target, room, data }, (response) => 
        {
            response.isSuccess ? resolve(response) : reject(response);
        });
    });
};

ViewModel.initHostUser = () => 
{
    ViewModel.isHostUser = true;
    if (ViewModel.gameState === null)
    {
        const userName = ViewModel.getUserState(ViewModel.constants.USER_NAME);
        ViewModel.gameState = {};
        ViewModel.gameState.players = {};
        ViewModel.gameState.players[userName] = { userName, isOnline: true };
        ViewModel.gameState.papers = [];
        ViewModel.gameState.writeStage = -1;
        ViewModel.gameState.phase = ViewModel.phases.LOBBY;
    }

    ensureSocketInit();
    socket.on(ViewModel.msg.events.MSG, msgHandler);
};

ViewModel.initClientUser = () =>
{
    ViewModel.isHostUser = false;
    ensureSocketInit();
    socket.on(ViewModel.msg.events.MSG, (msg, reply) => 
    {
        if(msg.type === ViewModel.msg.types.STATE_UPDATE)
        {
            ViewModel.gameState = msg.data;
            ViewModel.activeView.syncStates();
        }
    });
};

ViewModel.goTo = (path) => 
{
    ViewModel.history.push(path);
};

ViewModel.getRandomCode = () =>
{
    if (ViewModel.randomCodeLength > 10) ViewModel.randomCodeLength = 10;
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16).substring(10 - ViewModel.randomCodeLength);
};

ViewModel.startRound = () => 
{
    ViewModel.gameState.phase = ViewModel.phases.WRITE;
    ViewModel.gameState.writeStage = 0;
    Object.keys(ViewModel.gameState.players).forEach(userName => 
    {
        ViewModel.gameState.papers.push(
            {
                parts: [],
                currentHolder: ViewModel.gameState.players[userName]
            });
    });
    ViewModel.sendToRoom(ViewModel.msg.types.STATE_UPDATE, ViewModel.msg.targets.OTHERS, ViewModel.gameState);
    ViewModel.activeView.syncStates();
};

// ViewModel.ApplyAssignments = (assignments) =>
// {
//     for (var key in assignments)
//     {
//         if (!assignments.hasOwnProperty(key)) continue;
//         ViewModel.gameState.papers[key].currentEditor = assignments[key];
//     }
// }

// ViewModel.OnDisconnectSignal = (connectionId) =>
// {
//     // get the user name of the player associated with the disconnected connection
//     var playerUserName = null;
//     for (var key in ViewModel.gameState.players)
//     {
//         if (!ViewModel.gameState.players.hasOwnProperty(key)) continue;
//         if (ViewModel.gameState.players[key] === connectionId)
//         {
//             playerUserName = key;
//             break;
//         }
//     }
//     if (!playerUserName) return;

//     // invalidate connection entry of that user
//     ViewModel.gameState.players[playerUserName] = null;

//     // if the disconnected user is the host, choose new host
//     if (playerUserName === ViewModel.gameState.hostUserName && ViewModel.UserName === chooseNewHostUser())
//     {
//         ViewModel.isHostUser = true;
//         $("body").removeClass("nonHost").addClass("host");
//         ViewModel.gameState.hostUserName = ViewModel.UserName;
//         //TODO:  ViewModel.SignalHub.Broadcast({ type: "hostChanged", key: ViewModel.gameState.key, newHostUserName: ViewModel.gameState.hostUserName });
//         ViewModel.Views.ParticipantsBox.Update();
//     }

//     // anounce via chat
//     ViewModel.Views.ChatBox.Update(playerUserName + " has disconnected");
// }

// ViewModel.KickPlayer = (playerUserName) =>
// {
//     if (ViewModel.UserName === playerUserName)
//     {
//         window.onbeforeunload = null;
//         window.location.href = "/";
//         return;
//     }
//     ViewModel.gameState.players = deleteKey(ViewModel.gameState.players, playerUserName);
//     if (ViewModel.gameState.status > 0)
//     {
//         var paper = ViewModel.GetCurrentPaperFor(playerUserName);
//         ViewModel.gameState.papers = deleteKey(ViewModel.gameState.papers, paper.id);
//     }
//     if (ViewModel.isHostUser)
//     {
//         //TODO:  ViewModel.SignalHub.Broadcast({ type: "playerKicked", key: ViewModel.gameState.key, userName: playerUserName });
//     }
//     ViewModel.Views.ParticipantsBox.Update();
//     ViewModel.Views.ChatBox.Update(playerUserName + " has been kicked");
//     if (ViewModel.gameState.status > 0 && ViewModel.isHostUser && ViewModel.Controller.GetCurrentUnsubmittedPlayers().length === 0)
//     {
//         ViewModel.Controller.StartNextPhrase();
//     } else
//     {
//         ViewModel.ActivePage.Refresh();
//     }
// }

// ViewModel.CreateRoom = (roomCode, userName) =>
// {
//     if (!userName) return;
//     ViewModel.UserName = userName;
//     ViewModel.RoomCode = roomCode;
//     ViewModel.gameState = {};
//     ViewModel.gameState.lang = ViewModel.DefaultLang;
//     ViewModel.gameState.key = ViewModel.getRandomCode() + ViewModel.getRandomCode();
//     ViewModel.gameState.hostUserName = ViewModel.UserName;
//     ViewModel.gameState.players = {};
//     //TODO: ViewModel.gameState.players[ViewModel.UserName] = ViewModel.SignalHub.GetConnectionId();
//     ViewModel.gameState.status = 0;
//     ViewModel.isHostUser = true;
//     $("body").removeClass("nonHost").addClass("host");
//     //TODO: ViewModel.SignalHub.JoinRoom(ViewModel.RoomCode, ViewModel.gameState.key, () =>
//     // {
//     //     ViewModel.LoadPage(ViewModel.Views.LobbyPage);
//     // });
// }

// ViewModel.SendJoinRequest = (roomCode, userName) =>
// {
//     if (!roomCode || !userName || ViewModel.JoinRequest !== null) return;
//     ViewModel.JoinRequest =
//         {
//             type: "joinRequest",
//             roomCode: roomCode,
//             userName: userName
//         };
//     //TODO:  ViewModel.SignalHub.SendAndWait(roomCode, ViewModel.JoinRequest);
// }

// ViewModel.StartNewRound = (language) =>
// {
//     if (!ViewModel.isHostUser) return;
//     ViewModel.gameState.lang = language ? language : ViewModel.DefaultLang;
//     ViewModel.gameState.papers =
//         {};
//     for (var key in ViewModel.gameState.players)
//     {
//         if (!ViewModel.gameState.players.hasOwnProperty(key)) continue;
//         var paperId = ViewModel.getRandomCode();
//         ViewModel.gameState.papers[paperId] =
//             { id: paperId, currentEditor: key };
//     }
//     ViewModel.gameState.status = 1;
//     //TODO:  ViewModel.SignalHub.Broadcast({ type: "startRound", key: ViewModel.gameState.key, lang: ViewModel.gameState.lang, papers: ViewModel.gameState.papers });
//     ViewModel.LoadPage(ViewModel.Views.WritePage);
// }

// ViewModel.StartNextPhrase = () =>
// {
//     if (!ViewModel.isHostUser) return;
//     var newAssignments = getNewPaperAssignments();
//     ViewModel.ApplyAssignments(newAssignments);
//     ViewModel.gameState.status++;
//     if (ViewModel.gameState.status > ViewModel.NumPhrases)
//     {
//         //TODO:  ViewModel.SignalHub.Broadcast({ type: "reveal", key: ViewModel.gameState.key, assignments: newAssignments });
//         ViewModel.LoadPage(ViewModel.Views.RevealPage);
//     } else
//     {
//         //TODO:  ViewModel.SignalHub.Broadcast({ type: "nextPhrase", key: ViewModel.gameState.key, assignments: newAssignments });
//         ViewModel.LoadPage(ViewModel.Views.WritePage);
//     }
// }

// ViewModel.GetCurrentPaperFor = (userNameArg) =>
// {
//     for (var key in ViewModel.gameState.papers)
//     {
//         if (!ViewModel.gameState.papers.hasOwnProperty(key)) continue;
//         var paper = ViewModel.gameState.papers[key];
//         if (paper.currentEditor === userNameArg) return paper;
//     }
//     return null;
// }

// ViewModel.SubmitPhrase = (phrase) =>
// {
//     if (!phrase) return;
//     console.log("phrase submitted: " + phrase);
//     var paper = ViewModel.Controller.GetCurrentPaperFor(ViewModel.UserName);
//     paper["phrase" + ViewModel.gameState.status] = phrase;
//     paper["phrase" + ViewModel.gameState.status + "author"] = ViewModel.UserName;
//     //TODO:  ViewModel.SignalHub.Broadcast({ type: "phraseSubmitted", key: ViewModel.gameState.key, value: phrase, paperId: paper.id });
//     if (ViewModel.isHostUser && ViewModel.Controller.GetCurrentUnsubmittedPlayers().length === 0)
//     {
//         ViewModel.Controller.StartNextPhrase();
//     } else
//     {
//         ViewModel.LoadPage(ViewModel.Views.PhraseSubmittedPage);
//     }
// }

// ViewModel.IsCurrentPhraseSubmitted = () =>
// {
//     var paper = ViewModel.Controller.GetCurrentPaperFor(ViewModel.UserName);
//     return !!paper["phrase" + ViewModel.gameState.status];
// }

// ViewModel.GetCurrentUnsubmittedPlayers = () =>
// {
//     var players = [];
//     for (var key in ViewModel.gameState.papers)
//     {
//         if (!ViewModel.gameState.papers.hasOwnProperty(key)) continue;
//         var paper = ViewModel.gameState.papers[key];
//         if (!paper["phrase" + ViewModel.gameState.status])
//         {
//             players.push(paper.currentEditor);
//         }
//     }
//     return players;
// }

// ViewModel.ValidateMessage = (message) =>
// {
//     var isValid = (!!ViewModel.gameState && ViewModel.gameState.key === message.key);
//     if (!isValid)
//     {
//         ViewModel.Controller.LoadPage(ViewModel.Views.ErrorPage);
//     }
//     return isValid;
// }

// ViewModel.GetQueryParameter = (name) =>
// {
//     var url = window.location.href;
//     name = name.replace(/[[\]]/g, "\\$&");
//     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
//         results = regex.exec(url);
//     if (!results) return null;
//     if (!results[2]) return '';
//     return decodeURIComponent(results[2].replace(/\+/g, " "));
// }


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

// const getNewPaperAssignments = () =>
// {
//     var ids = [];
//     for (var key in ViewModel.gameState.papers)
//     {
//         if (!ViewModel.gameState.papers.hasOwnProperty(key)) continue;
//         ids.push(ViewModel.gameState.papers[key].id);
//     }
//     ids.sort();
//     var assignments =
//         {};
//     for (var i = 0; i < ids.length; i++)
//     {
//         var index = i === 0 ? ids.length - 1 : i - 1;
//         assignments[ids[i]] = ViewModel.gameState.papers[ids[index]].currentEditor;
//     }
//     return assignments;
// }

// const deleteKey = (obj, keyToDelete) =>
// {
//     var newObj =
//         {};
//     for (var key in obj)
//     {
//         if (!obj.hasOwnProperty(key) || key === keyToDelete) continue;
//         newObj[key] = obj[key];
//     }
//     return newObj;
// }

// const chooseNewHostUser = () =>
// {
//     var playerUserNames = [];
//     for (var key in ViewModel.gameState.players)
//     {
//         if (!ViewModel.gameState.players.hasOwnProperty(key) || !ViewModel.gameState.players[key]) continue;
//         playerUserNames.push(key);
//     }
//     playerUserNames.sort();
//     return playerUserNames[0];
// }

const ensureSocketInit = () =>
{
    const origin = (window.location.origin.indexOf("localhost") >= 0) ? "http://localhost:1337" : window.location.origin;
    if (socket === null)
        socket = io(origin);
};

export default ViewModel;