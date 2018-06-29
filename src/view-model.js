import { Paper, Player, GameState, JoinApprovedResponse, JoinRejectedResponse, StartRoundMessage } from './models';
import Constants from './constants';
import ClientSocket from './client-socket';

const ViewModel = {};
ViewModel.activeView = null;
ViewModel.history = null;
ViewModel.gameState = null;


//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ViewModel.getUserName = () => 
{
    return sessionStorage.getItem(Constants.USER_NAME);
};

ViewModel.setUserName = (value) => 
{
    sessionStorage.setItem(Constants.USER_NAME, value);
};

ViewModel.getRoomCode = () => 
{
    return sessionStorage.getItem(Constants.ROOM_CODE);
};

ViewModel.setRoomCode = (value) => 
{
    ClientSocket.roomCode = value;
    sessionStorage.setItem(Constants.ROOM_CODE, value);
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

ViewModel.isHostUser = () => 
{
    return ViewModel.gameState && ViewModel.getUserName() === ViewModel.gameState.hostUserName;
};

ViewModel.initHostUser = () => 
{
    const userName = ViewModel.getUserName();
    const socketId = ClientSocket.getSocketId();
    const hostPlayer = new Player(userName, socketId);
    ViewModel.gameState = new GameState(hostPlayer, Constants.phases.LOBBY);
    ViewModel.gameState.players[userName] = hostPlayer;
};

ViewModel.startRound = (lang) => 
{
    ViewModel.gameState.lang = lang;
    ViewModel.gameState.phase = Constants.phases.WRITE;
    ViewModel.gameState.activePart = 1;
    Object.keys(ViewModel.gameState.players).forEach(userName => 
    {
        ViewModel.gameState.players[userName].paper = new Paper();
    });
    ViewModel.activeView.updateUI();
    if(ViewModel.isHostUser())
        ClientSocket.sendToCurrentRoom(Constants.msg.types.START_ROUND, new StartRoundMessage(lang));
};

ViewModel.submitPart = (part) => 
{
    ClientSocket.sendToCurrentRoom(Constants.msg.types.SUBMIT_PART, part);
    handlePartSubmitted(part);
};


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const handleMessage = (msg) => 
{
    switch(msg.type)
    {
        case Constants.msg.types.JOIN_REQUEST:
            handleJoinRequest(msg);
            break;
        case Constants.msg.types.PLAYER_JOINED:
            handlePlayerJoined(msg.data);
            break;
        case Constants.msg.types.SUBMIT_PART:
            handlePartSubmitted(msg.data);
            break;
        case Constants.msg.types.START_ROUND:
            ViewModel.startRound(msg.data.lang);
            break;
        case Constants.msg.types.GOTO_LOBBY:
            ViewModel.gameState.phase = Constants.phases.LOBBY;
            ViewModel.activeView.updateUI();
            break;
        default:
            break;
    }
};

const handleJoinRequest = (msg) => 
{
    // join request should only be handled by host
    if(!ViewModel.activeView.isRoomView || !ViewModel.isHostUser())
        return;

    // check if the chosen name already taken by someone else in the room
    if (ViewModel.gameState.players[msg.data.userName])
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
            new JoinRejectedResponse(Constants.msg.errors.USER_NAME_EXISTS));
        return;
    }

    const room = ViewModel.getRoomCode();
    const player = new Player(msg.data.userName, msg.source);
    ViewModel.activeView.updateUI();
    ClientSocket.sendToCurrentRoom(Constants.msg.types.PLAYER_JOINED, player);
    ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
        new JoinApprovedResponse(room, ViewModel.gameState));
    handlePlayerJoined(player);
};

const handlePlayerJoined = (player) =>
{
    // if a round is ongoing, put the player as spectator
    if(ViewModel.gameState.phase > Constants.phases.LOBBY)
        player.isSpectating = true;
    ViewModel.gameState.players[player.userName] = player;
    //TODO: ViewModel.Views.ChatBox.Update(msg.data.userName + " has joined");
};

const handlePartSubmitted = (part) =>
{
    const author = ViewModel.gameState.players[part.authorUserName];
    if(!author)
    {
        console.log("[ViewModel.submitPart] player not found with username " + part.authorUserName);
        return;
    }
    author.paper.parts.push(part);

    let readyToProceed = true;
    Object.keys(ViewModel.gameState.players).forEach(userName => 
        {
            const player = ViewModel.gameState.players[userName];
            if(player.isSpectating)
                return;
            const paper = player.paper;
            if(paper && paper.parts.length < ViewModel.gameState.activePart)
                readyToProceed = false;
        });

    if(readyToProceed)
    {
        if(ViewModel.gameState.activePart >= Constants.TOTAL_PARTS)
            ViewModel.gameState.phase = Constants.phases.REVEAL;
        else
        {
            movePapers();
            ViewModel.gameState.activePart++;
        }
    }

    ViewModel.activeView.updateUI();
}

const movePapers = () =>
{
    const userNames = [];
    Object.keys(ViewModel.gameState.players).forEach(userName => 
        {
            if(!ViewModel.gameState.players[userName].isSpectating)
                userNames.push(userName);
        });
    userNames.sort();

    const players = ViewModel.gameState.players;
    const firstPaper = ViewModel.gameState.players[userNames[0]].paper;
    userNames.forEach((userName, index) => 
    {
        players[userName].paper = (index < userNames.length - 1) ? 
            players[userNames[index+1]].paper : firstPaper;
    });
};

const initialize = () =>
{
    ClientSocket.addMessageHandler(handleMessage);
};

initialize();
export default ViewModel;

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