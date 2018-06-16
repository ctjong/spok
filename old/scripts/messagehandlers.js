var Spok = Spok || {};
Spok.MessageHandlers = Spok.Views || {};

Spok.MessageHandlers = {};

Spok.MessageHandlers["joinResponse"] = {
    Execute: function(message) {
        if (!Spok.JoinRequest) return;
        if (message.response === "accepted") {
            Spok.SignalHub.JoinRoom(Spok.JoinRequest.roomCode, message.gameState.key, function () {
                $("body").removeClass("host").addClass("nonHost");
                Spok.RoomCode = Spok.JoinRequest.roomCode;
                Spok.UserName = Spok.JoinRequest.userName;
                Spok.GameState = $.extend({}, message.gameState);
                var gameStatus = Spok.GameState.status;
                if (gameStatus === 6) {
                    Spok.Controller.LoadPage(Spok.Views.RevealPage);
                } else if (gameStatus > 0 && gameStatus < 6) {
                    if (!Spok.Controller.IsCurrentPhraseSubmitted()) {
                        Spok.Controller.LoadPage(Spok.Views.WritePage);
                    } else {
                        Spok.Controller.LoadPage(Spok.Views.PhraseSubmittedPage);
                    }
                } else {
                    Spok.Controller.LoadPage(Spok.Views.LobbyPage);
                }
            });
            return;
        }

        if (Spok.ActivePage !== Spok.Views.JoinPage) Spok.Controller.LoadPage(Spok.Views.JoinPage);
        if (message.response === "nameExists") {
            Spok.Views.JoinPage.ShowError("username already taken. please enter a different name");
        } else if (message.response === "gameStarted") {
            Spok.Views.JoinPage.ShowError("a round has started in that room. please wait until they are back in the lobby or try another room.");
        } else {
            Spok.Views.JoinPage.ShowError("an error occurred. please try a different room");
        }
        Spok.JoinRequest = null;
    }
}

Spok.MessageHandlers["joinRequest"] = {
    Execute: function (message) {
        if (!Spok.IsHostUser) return;
        if (Spok.GameState.players[message.userName] === null) {
            // the player was disconnected and is reconnecting. accept right away.
            Spok.GameState.players[message.userName] = message.connectionId;
            Spok.SignalHub.Reply(message, { type: "joinResponse", response: "accepted", gameState: $.extend({}, Spok.GameState) });
            Spok.Views.ChatBox.Update(message.userName + " has reconnected");
            Spok.Views.ParticipantsBox.Update();
        } else if (message.userName in Spok.GameState.players) {
            // the chosen name already taken by someone else in the room
            Spok.SignalHub.Reply(message, { type: "joinResponse", response: "nameExists" });
        } else if (Spok.GameState.status !== 0) {
            // a round has started
            Spok.SignalHub.Reply(message, { type: "joinResponse", response: "gameStarted" });
        } else {
            // valid name chosen, people are still in the lobby. send acceptance.
            Spok.GameState.players[message.userName] = message.connectionId;
            Spok.SignalHub.Reply(message, { type: "joinResponse", response: "accepted", gameState: $.extend({}, Spok.GameState) });
            Spok.SignalHub.Broadcast({ type: "playerJoined", key: Spok.GameState.key, userName: message.userName, connectionId: message.connectionId });
            Spok.Views.ChatBox.Update(message.userName + " has joined");
            Spok.Views.ParticipantsBox.Update();
        }
    }
}

Spok.MessageHandlers["timeout"] = {
    Execute: function (message) {
        console.log("timeout signal received");
        var requestType = message.request.type;
        if (requestType === "joinRequest") {
            if (Spok.ActivePage !== Spok.Views.JoinPage) Spok.Controller.LoadPage(Spok.Views.JoinPage);
            Spok.Views.JoinPage.ShowError("request timed out. please try a different room");
        }
    }
}

Spok.MessageHandlers["playerJoined"] = {
    Execute: function (message) {
        if (!Spok.Controller.ValidateMessage(message)) return;
        if (message.userName in Spok.GameState.players) return;
        Spok.GameState.players[message.userName] = message.connectionId;
        Spok.ActivePage.Refresh();
        Spok.Views.ChatBox.Update(message.userName + " has joined");
        Spok.Views.ParticipantsBox.Update();
    }
}

Spok.MessageHandlers["startRound"] = {
    Execute: function(message) {
        if (!Spok.Controller.ValidateMessage(message)) return;
        Spok.GameState.lang = message.lang;
        Spok.GameState.sentences = $.extend({}, message.sentences);
        Spok.GameState.status = 1;
        Spok.Controller.LoadPage(Spok.Views.WritePage);
    }
}

Spok.MessageHandlers["phraseSubmitted"] = {
    Execute: function(message) {
        if (!Spok.Controller.ValidateMessage(message)) return;
        var sentence = Spok.GameState.sentences[message.sentenceId];
        sentence["phrase" + Spok.GameState.status] = message.value;
        sentence["phrase" + Spok.GameState.status + "author"] = sentence.currentEditor;
        if (Spok.Controller.GetCurrentUnsubmittedPlayers().length === 0) {
            Spok.Controller.StartNextPhrase();
        } else if (Spok.ActivePage === Spok.Views.PhraseSubmittedPage) {
            Spok.ActivePage.Refresh();
        }
    }
}

Spok.MessageHandlers["nextPhrase"] = {
    Execute: function(message) {
        if (!Spok.Controller.ValidateMessage(message)) return;
        Spok.GameState.status++;
        Spok.Controller.ApplyAssignments(message.assignments);
        Spok.Controller.LoadPage(Spok.Views.WritePage);
    }
}

Spok.MessageHandlers["reveal"] = {
    Execute: function(message) {
        if (!Spok.Controller.ValidateMessage(message)) return;
        Spok.GameState.status = 6;
        Spok.Controller.ApplyAssignments(message.assignments);
        Spok.Controller.LoadPage(Spok.Views.RevealPage);
    }
}

Spok.MessageHandlers["endRound"] = {
    Execute: function(message) {
        if (!Spok.Controller.ValidateMessage(message)) return;
        Spok.GameState.status = 0;
        Spok.GameState.sentences = {};
        Spok.Controller.LoadPage(Spok.Views.LobbyPage);
    }
}

Spok.MessageHandlers["hostChanged"] = {
    Execute: function(message) {
        if (!Spok.Controller.ValidateMessage(message)) return;
        Spok.GameState.hostUserName = message.newHostUserName;
    }
}

Spok.MessageHandlers["chat"] = {
    Execute: function(message) {
        if (!Spok.Controller.ValidateMessage(message)) return;
        Spok.Views.ChatBox.Update(message.content, message.author);
    }
}

Spok.MessageHandlers["playerKicked"] = {
    Execute: function (message) {
        if (!Spok.Controller.ValidateMessage(message)) return;
        Spok.Controller.KickPlayer(message.userName);
    }
}