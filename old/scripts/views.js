var Spok = Spok || {};
Spok.Views = Spok.Views || {};

Spok.Views.HomePage = {
    ViewId: "homePage",
    InGame: false,
    Clicks: {
        ".joinBtn": function () { window.location.href = "?action=join" },
        ".createBtn": function () { window.location.href = "?action=create" },
        ".howToBtn": function () { window.location.href = "?action=howto" }
    }
}

Spok.Views.JoinPage = {
    ViewId: "joinPage",
    InGame: false,
    ShowError: function (error) {
        $(".joinPage .error").html(error);
    },
    Inputs: "#joinPage_roomCode,#joinPage_userName",
    Clicks: {
        ".submitBtn": function () {
            var roomCode = $("#joinPage_roomCode").val().toLowerCase();
            var userName = $("#joinPage_userName").val();
            var newQueryParams = "?action=play&room=" + encodeURIComponent(roomCode) + "&user=" + encodeURIComponent(userName);
            var currentUrl = window.location.href;
            if (currentUrl.indexOf(newQueryParams) >= 0) {
                window.location.reload();
            } else {
                window.location.href = newQueryParams;
            }
        },
        ".backBtn": function () {
            window.location.href = Spok.BaseUrl;
        }
    },
    OnLoad:function() {
        var roomCode = Spok.Controller.GetQueryParameter("room");
        if (!roomCode) return;
        $("#joinPage_roomCode").val(roomCode);
    }
}

Spok.Views.CreatePage = {
    ViewId: "createPage",
    InGame: false,
    Inputs: "#createPage_userName",
    Clicks: {
        ".submitBtn": function () {
            var userName = $("#createPage_userName").val().toLowerCase();
            var roomCode = Spok.Controller.RandomCode();
            sessionStorage["createRequested"] = "1";
            window.location.href = "?action=play&room=" + encodeURIComponent(roomCode) + "&user=" + encodeURIComponent(userName);
        },
        ".backBtn": function () {
            window.location.href = Spok.BaseUrl;
        }
    }
}

Spok.Views.HowToPage = {
    ViewId: "howToPage",
    InGame: false,
    Clicks: {
        ".backBtn": function () {
            window.location.href = Spok.BaseUrl;
        }
    }
}

Spok.Views.LoadingPage = {
    ViewId: "loadingPage",
    InGame: false,
    Refresh: function () { }
}

Spok.Views.ErrorPage = {
    ViewId: "errorPage",
    InGame: false,
    Refresh: function () { },
    Clicks: {
        ".homeBtn": function () { window.location.href = Spok.BaseUrl; }
    }
}

Spok.Views.LobbyPage = {
    ViewId: "lobbyPage",
    InGame: true,
    Refresh: function () {
        var joinLink = Spok.BaseUrl + "?action=play&room=" + Spok.RoomCode;
        $(".joinLink").html(joinLink);
        $(".joinLinkWa").attr("href", "whatsapp://send?text=" + encodeURIComponent(joinLink));
    },
    Clicks: {
        ".startBtn": function () {
            Spok.Controller.StartNewRound($(".langOptions").val());
        }
    },
    OnLoad: function () {
        $(".roomCode").html(Spok.RoomCode);
        var options = "";
        for (var key in Spok.Strings) {
            if (!Spok.Strings.hasOwnProperty(key)) continue;
            options += "<option value='" + key + "' " + (key === Spok.DefaultLang ? "selected" : "") + ">" + Spok.Strings[key].langName + "</option>";
        }
        $(".langOptions").html(options);
    }
}

Spok.Views.WritePage = {
    ViewId: "writePage",
    InGame: true,
    Clicks: {
        ".submitBtn": function() {
            Spok.Controller.SubmitPhrase($(".writePage input").val());
        }
    },
    Refresh: function () {
        var currentSentence = Spok.Controller.GetCurrentSentenceFor(Spok.UserName);
        $(".sentenceId").html(currentSentence.id);

        var status = Spok.gameState.status;
        $(".writePage label").text(Spok.Strings[Spok.gameState.lang]["phrase" + status + "label"]);
        $(".writePage input").val("").attr("placeholder", Spok.Strings[Spok.gameState.lang]["phrase" + status + "placeholder"]);
    },
    OnLoad: function () {
        $(".roomCode").html(Spok.RoomCode);
        $(".userName").html(Spok.UserName);
    }
}

Spok.Views.PhraseSubmittedPage = {
    ViewId: "phraseSubmittedPage",
    InGame: true,
    Refresh: function () {
        var currentSentence = Spok.Controller.GetCurrentSentenceFor(Spok.UserName);
        $(".sentenceId").html(currentSentence.id);

        var currentUnsubmitted = Spok.Controller.GetCurrentUnsubmittedPlayers();
        $(".waitList").text(currentUnsubmitted.join(", "));
    },
    OnLoad: function() {
        $(".roomCode").html(Spok.RoomCode);
        $(".userName").html(Spok.UserName);
    }
}

Spok.Views.RevealPage = {
    ViewId: "revealPage",
    InGame: true,
    Inputs: ".form-inline input",
    Clicks: {
        ".newRoundBtn": function () {
            Spok.Controller.StartNewRound(Spok.gameState.lang);
        },
        ".endRoundBtn": function () {
            Spok.SignalHub.Broadcast({ type: "endRound", key: Spok.gameState.key });
            Spok.gameState.status = 0;
            Spok.gameState.sentences = {};
            Spok.Controller.LoadPage(Spok.Views.LobbyPage);
        },
        ".shareResultLink": function () {
            var sentence = $(".resultSentence").html();
            Spok.Views.ChatBox.Update(sentence, Spok.UserName);
            Spok.SignalHub.Broadcast({ type: "chat", key: Spok.gameState.key, author: Spok.UserName, content: sentence });
        }
    },
    Refresh: function () {
        var currentSentence = Spok.Controller.GetCurrentSentenceFor(Spok.UserName);
        $(".sentenceId").html(currentSentence.id);

        var sentence = "";
        var sentenceAuthors = "";
        for (var i = 1; i <= 5; i++) {
            var currentPhrase = currentSentence["phrase" + i];
            if (!currentPhrase) continue;
            sentence += (sentence === "" ? "" : " ") + currentPhrase.toLowerCase();
            sentenceAuthors += (sentenceAuthors === "" ? "" : ", ") + currentPhrase.toLowerCase() + " (" + currentSentence["phrase" + i + "author"] + ")";
        }
        $(".revealModeWaitText").text("Pending action from " + Spok.gameState.hostUserName);
        $(".resultSentence").text(sentence);
        $(".sentenceAuthors").text(sentenceAuthors);
    },
    OnLoad: function () {
        $(".roomCode").html(Spok.RoomCode);
        $(".userName").html(Spok.UserName);
    }
}

Spok.Views.ParticipantsBox = {
    ViewId: "participantsBox",
    Show: function () {
        $(".participantsBox").show();
        Spok.Views.ParticipantsBox.Update();
    },
    Hide: function () {
        $(".participantsBox").hide();
    },
    Update: function () {
        var text = "";
        for (var key in Spok.gameState.players) {
            if (!Spok.gameState.players.hasOwnProperty(key)) continue;
            var str = "<span><span className='playerName'>" + key + "</span>";
            if (Spok.IsHostUser && key !== Spok.UserName) str += " (<a className='playerKick'>kick</a>) ";
            str += "</span>";
            text += (text === "" ? "" : ", ") + str;
        }
        $(".participants").html(text);
        $(".playerKick").click(function() {
            var targetPlayer = $(this).parent().find(".playerName").text();
            Spok.Controller.KickPlayer(targetPlayer);
        });
    }
}

Spok.Views.ChatBox = {
    ViewId: "chatbox",
    Initialized: false,
    Show: function () {
        if (!Spok.Views.ChatBox.Initialized) Spok.Views.ChatBox.Initialize();
        $(".chatbox").show();
    },
    Hide: function () {
        $(".chatbox").hide();
    },
    Update: function (message, author) {
        if (!message) return;
        if (!author) {
            $(".chatbox-innerchats").append("<div className='announcement'>" + message + "</div>");
        } else {
            $(".chatbox-innerchats").append("<div className='chat'><span className='chat-author'>" + author + "</span><span className='chat-content'>" + message + "</span></div>");
        }
        $(".chatbox-chats").scrollTop($(".chatbox-innerchats").height());
    },
    Initialize: function () {
        function submitChat() {
            var chat = $(".chatbox-input").val();
            if (!chat) return;
            $(".chatbox-input").val("").focus();
            Spok.Views.ChatBox.Update(chat, Spok.UserName);
            Spok.SignalHub.Broadcast({ type: "chat", key: Spok.gameState.key, author: Spok.UserName, content: chat });
        }
        $(".chat-send").unbind("click").click(submitChat);
        $(".chat-clear").unbind("click").click(function() { $(".chatbox-innerchats").html(""); });
        $(".chatbox").keypress(function (event) {
            if (event.which === 13) {
                submitChat();
            }
        });
    }
}