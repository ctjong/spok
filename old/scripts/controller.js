function Controller () {
    var instance = this;

    function getNewSentenceAssignments() {
        var ids = [];
        for (var key in Spok.GameState.sentences) {
            if (!Spok.GameState.sentences.hasOwnProperty(key)) continue;
            ids.push(Spok.GameState.sentences[key].id);
        }
        ids.sort();
        var assignments = {};
        for (var i = 0; i < ids.length; i++) {
            var index = i === 0 ? ids.length - 1 : i - 1;
            assignments[ids[i]] = Spok.GameState.sentences[ids[index]].currentEditor;
        }
        return assignments;
    }

    function deleteKey(obj, keyToDelete) {
        var newObj = {};
        for (var key in obj) {
            if (!obj.hasOwnProperty(key) || key === keyToDelete) continue;
            newObj[key] = obj[key];
        }
        return newObj;
    }

    function chooseNewHostUser() {
        var playerUserNames = [];
        for (var key in Spok.GameState.players) {
            if (!Spok.GameState.players.hasOwnProperty(key) || !Spok.GameState.players[key]) continue;
            playerUserNames.push(key);
        }
        playerUserNames.sort();
        return playerUserNames[0];
    }

    this.ApplyAssignments = function (assignments) {
        for (var key in assignments) {
            if (!assignments.hasOwnProperty(key)) continue;
            Spok.GameState.sentences[key].currentEditor = assignments[key];
        }
    }

    this.OnDisconnectSignal = function (connectionId) {
        // get the user name of the player associated with the disconnected connection
        var playerUserName = null;
        for (var key in Spok.GameState.players) {
            if (!Spok.GameState.players.hasOwnProperty(key)) continue;
            if (Spok.GameState.players[key] === connectionId) {
                playerUserName = key;
                break;
            }
        }
        if (!playerUserName) return;

        // invalidate connection entry of that user
        Spok.GameState.players[playerUserName] = null;

        // if the disconnected user is the host, choose new host
        if (playerUserName === Spok.GameState.hostUserName && Spok.UserName === chooseNewHostUser()) {
            Spok.IsHostUser = true;
            $("body").removeClass("nonHost").addClass("host");
            Spok.GameState.hostUserName = Spok.UserName;
            Spok.SignalHub.Broadcast({ type: "hostChanged", key: Spok.GameState.key, newHostUserName: Spok.GameState.hostUserName });
            Spok.Views.ParticipantsBox.Update();
        }

        // anounce via chat
        Spok.Views.ChatBox.Update(playerUserName + " has disconnected");
    }

    this.KickPlayer = function (playerUserName) {
        if (Spok.UserName === playerUserName) {
            window.onbeforeunload = null;
            window.location.href = "/";
            return;
        }
        Spok.GameState.players = deleteKey(Spok.GameState.players, playerUserName);
        if (Spok.GameState.status > 0) {
            var sentence = instance.GetCurrentSentenceFor(playerUserName);
            Spok.GameState.sentences = deleteKey(Spok.GameState.sentences, sentence.id);
        }
        if (Spok.IsHostUser) {
            Spok.SignalHub.Broadcast({ type: "playerKicked", key: Spok.GameState.key, userName: playerUserName });
        }
        Spok.Views.ParticipantsBox.Update();
        Spok.Views.ChatBox.Update(playerUserName + " has been kicked");
        if (Spok.GameState.status > 0 && Spok.IsHostUser && Spok.Controller.GetCurrentUnsubmittedPlayers().length === 0) {
            Spok.Controller.StartNextPhrase();
        } else {
            Spok.ActivePage.Refresh();
        }
    }

    this.CreateRoom = function (roomCode, userName) {
        if (!userName) return;
        Spok.UserName = userName;
        Spok.RoomCode = roomCode;
        Spok.GameState = {};
        Spok.GameState.lang = Spok.DefaultLang;
        Spok.GameState.key = instance.RandomCode() + instance.RandomCode();
        Spok.GameState.hostUserName = Spok.UserName;
        Spok.GameState.players = {};
        Spok.GameState.players[Spok.UserName] = Spok.SignalHub.GetConnectionId();
        Spok.GameState.status = 0;
        Spok.IsHostUser = true;
        $("body").removeClass("nonHost").addClass("host");
        Spok.SignalHub.JoinRoom(Spok.RoomCode, Spok.GameState.key, function () {
            instance.LoadPage(Spok.Views.LobbyPage);
        });
    }

    this.SendJoinRequest = function (roomCode, userName) {
        if (!roomCode || !userName || Spok.JoinRequest !== null) return;
        Spok.JoinRequest = {
            type: "joinRequest",
            roomCode: roomCode,
            userName: userName
        };
        Spok.SignalHub.SendAndWait(roomCode, Spok.JoinRequest);
    }

    this.StartNewRound = function (language) {
        if (!Spok.IsHostUser) return;
        Spok.GameState.lang = language ? language : Spok.DefaultLang;
        Spok.GameState.sentences = {};
        for (var key in Spok.GameState.players) {
            if (!Spok.GameState.players.hasOwnProperty(key)) continue;
            var sentenceId = instance.RandomCode();
            Spok.GameState.sentences[sentenceId] = { id: sentenceId, currentEditor: key };
        }
        Spok.GameState.status = 1;
        Spok.SignalHub.Broadcast({ type: "startRound", key: Spok.GameState.key, lang: Spok.GameState.lang, sentences: Spok.GameState.sentences });
        instance.LoadPage(Spok.Views.WritePage);
    }

    this.StartNextPhrase = function () {
        if (!Spok.IsHostUser) return;
        var newAssignments = getNewSentenceAssignments();
        instance.ApplyAssignments(newAssignments);
        Spok.GameState.status++;
        if (Spok.GameState.status > Spok.NumPhrases) {
            Spok.SignalHub.Broadcast({ type: "reveal", key: Spok.GameState.key, assignments: newAssignments });
            instance.LoadPage(Spok.Views.RevealPage);
        } else {
            Spok.SignalHub.Broadcast({ type: "nextPhrase", key: Spok.GameState.key, assignments: newAssignments });
            instance.LoadPage(Spok.Views.WritePage);
        }
    }

    this.GetCurrentSentenceFor = function (userNameArg) {
        for (var key in Spok.GameState.sentences) {
            if (!Spok.GameState.sentences.hasOwnProperty(key)) continue;
            var sentence = Spok.GameState.sentences[key];
            if (sentence.currentEditor === userNameArg) return sentence;
        }
        return null;
    }

    this.SubmitPhrase = function (phrase) {
        if (!phrase) return;
        console.log("phrase submitted: " + phrase);
        var sentence = Spok.Controller.GetCurrentSentenceFor(Spok.UserName);
        sentence["phrase" + Spok.GameState.status] = phrase;
        sentence["phrase" + Spok.GameState.status + "author"] = Spok.UserName;
        Spok.SignalHub.Broadcast({ type: "phraseSubmitted", key: Spok.GameState.key, value: phrase, sentenceId: sentence.id });
        if (Spok.IsHostUser && Spok.Controller.GetCurrentUnsubmittedPlayers().length === 0) {
            Spok.Controller.StartNextPhrase();
        } else {
            instance.LoadPage(Spok.Views.PhraseSubmittedPage);
        }
    }

    this.IsCurrentPhraseSubmitted = function () {
        var sentence = Spok.Controller.GetCurrentSentenceFor(Spok.UserName);
        return !!sentence["phrase" + Spok.GameState.status];
    }

    this.GetCurrentUnsubmittedPlayers = function () {
        var players = [];
        for (var key in Spok.GameState.sentences) {
            if (!Spok.GameState.sentences.hasOwnProperty(key)) continue;
            var sentence = Spok.GameState.sentences[key];
            if (!sentence["phrase" + Spok.GameState.status]) {
                players.push(sentence.currentEditor);
            }
        }
        return players;
    }

    this.RandomCode = function () {
        if (Spok.RandomCodeLength > 10) Spok.RandomCodeLength = 10;
        return Math.floor((1 + Math.random()) * 0x1000000000).toString(16).substring(10 - Spok.RandomCodeLength);
    }

    this.ValidateMessage = function(message) {
        var isValid = (!!Spok.GameState && Spok.GameState.key === message.key);
        if (!isValid) {
            Spok.Controller.LoadPage(Spok.Views.ErrorPage);
        }
        return isValid;
    }

    this.GetQueryParameter = function (name) {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    this.LoadPage = function (targetPage) {
        if (!targetPage) return;
        if (targetPage === Spok.ActivePage) {
            if (!!targetPage.Refresh) targetPage.Refresh();
            return;
        }
        $(".page").hide();
        $("." + targetPage.ViewId).show();
        if (!!targetPage.Clicks) {
            for (var key in targetPage.Clicks) {
                if (!targetPage.Clicks.hasOwnProperty(key)) continue;
                $(key).unbind("click").click(targetPage.Clicks[key]);
            }
        }
        if (!!targetPage.Inputs) $(targetPage.Inputs).val("");
        if (!!targetPage.OnLoad) targetPage.OnLoad();
        if (!!targetPage.Refresh) {
            targetPage.Refresh();
        }
        if (!!targetPage.InGame) {
            window.onbeforeunload = function () {
                return "Are you sure want to exit the game?";
            }
            Spok.Views.ParticipantsBox.Show();
            Spok.Views.ChatBox.Show();
        } else {
            window.onbeforeunload = null;
            Spok.Views.ParticipantsBox.Hide();
            Spok.Views.ChatBox.Hide();
        }
        Spok.ActivePage = targetPage;
    }
}