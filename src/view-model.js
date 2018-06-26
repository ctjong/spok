import $ from 'jquery';
import io from 'socket.io-client';
import msgHandler from './services/host-message-handler';

const ViewModel = {};
ViewModel.ActiveView = null;
ViewModel.History = null;
ViewModel.IsHostUser = false;
ViewModel.GameState = null;

ViewModel.Phases = 
{
    LOBBY: 1,
    WRITE: 2,
    REVEAL: 3
};

ViewModel.Constants = 
{
    NUM_PHRASES: 4
};

let socket = null;

//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ViewModel.GetUserState = (name) => 
{
    return sessionStorage.getItem(name);
};

ViewModel.SetUserState = (name, value) => 
{
    sessionStorage.setItem(name, value);
};

ViewModel.SendToServer = (type, data) => 
{
    return ViewModel.SocketSend(type, "server", null, data);
};

ViewModel.SendToRoom = (type, target, data) => 
{
    return ViewModel.SocketSend(type, target, ViewModel.GetUserState("roomCode"), data);
};

ViewModel.SocketSend = (type, target, room, data) => 
{
    ensureSocketInit();
    return new Promise((resolve, reject) => 
    {
        socket.emit("message", { type, target, room, data }, (response) => 
        {
            response.isSuccess ? resolve(response) : reject(response);
        });
    });
};

ViewModel.InitHostUser = () => 
{
    ViewModel.IsHostUser = true;
    if(ViewModel.GameState === null)
    {
        ViewModel.GameState = {};
        ViewModel.GameState.Players = {};
        ViewModel.GameState.Players[ViewModel.GetUserState("userName")] = { isOnline: true };
        ViewModel.GameState.Papers = [];
        ViewModel.GameState.WriteStage = -1;
        ViewModel.GameState.Phase = ViewModel.Phases.LOBBY;
    }

    ensureSocketInit();
    socket.on("message", msgHandler);
};

ViewModel.GoTo = (path) => 
{
    ViewModel.History.push(path);
};

ViewModel.RandomCode = () =>
{
    if (ViewModel.RandomCodeLength > 10) ViewModel.RandomCodeLength = 10;
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16).substring(10 - ViewModel.RandomCodeLength);
};

// ViewModel.ApplyAssignments = (assignments) =>
// {
//     for (var key in assignments)
//     {
//         if (!assignments.hasOwnProperty(key)) continue;
//         ViewModel.GameState.papers[key].currentEditor = assignments[key];
//     }
// }

// ViewModel.OnDisconnectSignal = (connectionId) =>
// {
//     // get the user name of the player associated with the disconnected connection
//     var playerUserName = null;
//     for (var key in ViewModel.GameState.players)
//     {
//         if (!ViewModel.GameState.players.hasOwnProperty(key)) continue;
//         if (ViewModel.GameState.players[key] === connectionId)
//         {
//             playerUserName = key;
//             break;
//         }
//     }
//     if (!playerUserName) return;

//     // invalidate connection entry of that user
//     ViewModel.GameState.players[playerUserName] = null;

//     // if the disconnected user is the host, choose new host
//     if (playerUserName === ViewModel.GameState.hostUserName && ViewModel.UserName === chooseNewHostUser())
//     {
//         ViewModel.IsHostUser = true;
//         $("body").removeClass("nonHost").addClass("host");
//         ViewModel.GameState.hostUserName = ViewModel.UserName;
//         //TODO:  ViewModel.SignalHub.Broadcast({ type: "hostChanged", key: ViewModel.GameState.key, newHostUserName: ViewModel.GameState.hostUserName });
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
//     ViewModel.GameState.players = deleteKey(ViewModel.GameState.players, playerUserName);
//     if (ViewModel.GameState.status > 0)
//     {
//         var paper = ViewModel.GetCurrentPaperFor(playerUserName);
//         ViewModel.GameState.papers = deleteKey(ViewModel.GameState.papers, paper.id);
//     }
//     if (ViewModel.IsHostUser)
//     {
//         //TODO:  ViewModel.SignalHub.Broadcast({ type: "playerKicked", key: ViewModel.GameState.key, userName: playerUserName });
//     }
//     ViewModel.Views.ParticipantsBox.Update();
//     ViewModel.Views.ChatBox.Update(playerUserName + " has been kicked");
//     if (ViewModel.GameState.status > 0 && ViewModel.IsHostUser && ViewModel.Controller.GetCurrentUnsubmittedPlayers().length === 0)
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
//     ViewModel.GameState = {};
//     ViewModel.GameState.lang = ViewModel.DefaultLang;
//     ViewModel.GameState.key = ViewModel.RandomCode() + ViewModel.RandomCode();
//     ViewModel.GameState.hostUserName = ViewModel.UserName;
//     ViewModel.GameState.players = {};
//     //TODO: ViewModel.GameState.players[ViewModel.UserName] = ViewModel.SignalHub.GetConnectionId();
//     ViewModel.GameState.status = 0;
//     ViewModel.IsHostUser = true;
//     $("body").removeClass("nonHost").addClass("host");
//     //TODO: ViewModel.SignalHub.JoinRoom(ViewModel.RoomCode, ViewModel.GameState.key, () =>
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
//     if (!ViewModel.IsHostUser) return;
//     ViewModel.GameState.lang = language ? language : ViewModel.DefaultLang;
//     ViewModel.GameState.papers =
//         {};
//     for (var key in ViewModel.GameState.players)
//     {
//         if (!ViewModel.GameState.players.hasOwnProperty(key)) continue;
//         var paperId = ViewModel.RandomCode();
//         ViewModel.GameState.papers[paperId] =
//             { id: paperId, currentEditor: key };
//     }
//     ViewModel.GameState.status = 1;
//     //TODO:  ViewModel.SignalHub.Broadcast({ type: "startRound", key: ViewModel.GameState.key, lang: ViewModel.GameState.lang, papers: ViewModel.GameState.papers });
//     ViewModel.LoadPage(ViewModel.Views.WritePage);
// }

// ViewModel.StartNextPhrase = () =>
// {
//     if (!ViewModel.IsHostUser) return;
//     var newAssignments = getNewPaperAssignments();
//     ViewModel.ApplyAssignments(newAssignments);
//     ViewModel.GameState.status++;
//     if (ViewModel.GameState.status > ViewModel.NumPhrases)
//     {
//         //TODO:  ViewModel.SignalHub.Broadcast({ type: "reveal", key: ViewModel.GameState.key, assignments: newAssignments });
//         ViewModel.LoadPage(ViewModel.Views.RevealPage);
//     } else
//     {
//         //TODO:  ViewModel.SignalHub.Broadcast({ type: "nextPhrase", key: ViewModel.GameState.key, assignments: newAssignments });
//         ViewModel.LoadPage(ViewModel.Views.WritePage);
//     }
// }

// ViewModel.GetCurrentPaperFor = (userNameArg) =>
// {
//     for (var key in ViewModel.GameState.papers)
//     {
//         if (!ViewModel.GameState.papers.hasOwnProperty(key)) continue;
//         var paper = ViewModel.GameState.papers[key];
//         if (paper.currentEditor === userNameArg) return paper;
//     }
//     return null;
// }

// ViewModel.SubmitPhrase = (phrase) =>
// {
//     if (!phrase) return;
//     console.log("phrase submitted: " + phrase);
//     var paper = ViewModel.Controller.GetCurrentPaperFor(ViewModel.UserName);
//     paper["phrase" + ViewModel.GameState.status] = phrase;
//     paper["phrase" + ViewModel.GameState.status + "author"] = ViewModel.UserName;
//     //TODO:  ViewModel.SignalHub.Broadcast({ type: "phraseSubmitted", key: ViewModel.GameState.key, value: phrase, paperId: paper.id });
//     if (ViewModel.IsHostUser && ViewModel.Controller.GetCurrentUnsubmittedPlayers().length === 0)
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
//     return !!paper["phrase" + ViewModel.GameState.status];
// }

// ViewModel.GetCurrentUnsubmittedPlayers = () =>
// {
//     var players = [];
//     for (var key in ViewModel.GameState.papers)
//     {
//         if (!ViewModel.GameState.papers.hasOwnProperty(key)) continue;
//         var paper = ViewModel.GameState.papers[key];
//         if (!paper["phrase" + ViewModel.GameState.status])
//         {
//             players.push(paper.currentEditor);
//         }
//     }
//     return players;
// }

// ViewModel.ValidateMessage = (message) =>
// {
//     var isValid = (!!ViewModel.GameState && ViewModel.GameState.key === message.key);
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
//     for (var key in ViewModel.GameState.papers)
//     {
//         if (!ViewModel.GameState.papers.hasOwnProperty(key)) continue;
//         ids.push(ViewModel.GameState.papers[key].id);
//     }
//     ids.sort();
//     var assignments =
//         {};
//     for (var i = 0; i < ids.length; i++)
//     {
//         var index = i === 0 ? ids.length - 1 : i - 1;
//         assignments[ids[i]] = ViewModel.GameState.papers[ids[index]].currentEditor;
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
//     for (var key in ViewModel.GameState.players)
//     {
//         if (!ViewModel.GameState.players.hasOwnProperty(key) || !ViewModel.GameState.players[key]) continue;
//         playerUserNames.push(key);
//     }
//     playerUserNames.sort();
//     return playerUserNames[0];
// }

const ensureSocketInit = () =>
{
    const origin = (window.location.origin.indexOf("localhost") >= 0) ? "http://localhost:1337" : window.location.origin;
    if(socket === null)
        socket = io(origin);
};

export default ViewModel;