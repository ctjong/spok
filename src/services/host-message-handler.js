const sendStateUpdate = () => 
{
    ViewModel.SendToRoom("stateUpdate", "others", ViewModel.GameState);
};

const handleJoinRequest = (msg, reply) => 
{
    const player = ViewModel.GameState.Players[msg.data.userName];
    if (player && !player.isOnline)
    {
        // the player was disconnected and is reconnecting. accept right away.
        player.isOnline = true;
        reply({ isSuccess: true });
        sendStateUpdate();

        //TODO
        // ViewModel.Views.ChatBox.Update(msg.data.userName + " has reconnected");
        // ViewModel.Views.ParticipantsBox.Update();
    }
    else if (player && player.isOnline)
    {
        // the chosen name already taken by someone else in the room
        reply({ isSuccess: false, msg: "nameExists" })
    }
    else
    {
        // valid name chosen, people are still in the lobby. send acceptance.
        ViewModel.GameState.Players[msg.data.userName] = { isOnline: true };
        reply({ isSuccess: true });
        sendStateUpdate();

        //TODO
        // ViewModel.Views.ChatBox.Update(msg.data.userName + " has joined");
        // ViewModel.Views.ParticipantsBox.Update();
    }
};

export default (msg, reply) => 
{
    switch(msg.type)
    {
        case "joinRoom":
            handleJoinRequest(msg, reply);
            break;

    }
};

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
//             ViewModel.GameState = $.extend({}, message.gameState);
//             var gameStatus = ViewModel.GameState.status;
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
//     if (message.userName in ViewModel.GameState.Players) return;
//     ViewModel.GameState.Players[message.userName] = message.connectionId;
//     ViewModel.ActivePage.Refresh();
//     ViewModel.Views.ChatBox.Update(message.userName + " has joined");
//     ViewModel.Views.ParticipantsBox.Update();
// };

// MessageHandlers["startRound"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.GameState.lang = message.lang;
//     ViewModel.GameState.sentences = $.extend({}, message.sentences);
//     ViewModel.GameState.status = 1;
//     ViewModel.Controller.LoadPage(ViewModel.Views.WritePage);
// };

// MessageHandlers["phraseSubmitted"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     var sentence = ViewModel.GameState.sentences[message.sentenceId];
//     sentence["phrase" + ViewModel.GameState.status] = message.value;
//     sentence["phrase" + ViewModel.GameState.status + "author"] = sentence.currentEditor;
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
//     ViewModel.GameState.status++;
//     ViewModel.Controller.ApplyAssignments(message.assignments);
//     ViewModel.Controller.LoadPage(ViewModel.Views.WritePage);
// };

// MessageHandlers["reveal"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.GameState.status = 6;
//     ViewModel.Controller.ApplyAssignments(message.assignments);
//     ViewModel.Controller.LoadPage(ViewModel.Views.RevealPage);
// };

// MessageHandlers["endRound"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.GameState.status = 0;
//     ViewModel.GameState.sentences = {};
//     ViewModel.Controller.LoadPage(ViewModel.Views.LobbyPage);
// };

// MessageHandlers["hostChanged"] = (message) =>
// {
//     if (!ViewModel.Controller.ValidateMessage(message))
//         return;
//     ViewModel.GameState.hostUserName = message.newHostUserName;
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