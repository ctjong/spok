import createHistory from 'history/createBrowserHistory';
import $ from 'jquery';

const ViewModel = {};

ViewModel.App = null;


//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ViewModel.Initialize = () => 
{
    ViewModel.History = createHistory();
};

ViewModel.GoTo = (path) => 
{
    ViewModel.History.push(path);
    ViewModel.App.setState({ path: path });
};

ViewModel.ApplyAssignments = (assignments) =>
{
    for (var key in assignments)
    {
        if (!assignments.hasOwnProperty(key)) continue;
        ViewModel.GameState.sentences[key].currentEditor = assignments[key];
    }
}

ViewModel.OnDisconnectSignal = (connectionId) =>
{
    // get the user name of the player associated with the disconnected connection
    var playerUserName = null;
    for (var key in ViewModel.GameState.players)
    {
        if (!ViewModel.GameState.players.hasOwnProperty(key)) continue;
        if (ViewModel.GameState.players[key] === connectionId)
        {
            playerUserName = key;
            break;
        }
    }
    if (!playerUserName) return;

    // invalidate connection entry of that user
    ViewModel.GameState.players[playerUserName] = null;

    // if the disconnected user is the host, choose new host
    if (playerUserName === ViewModel.GameState.hostUserName && ViewModel.UserName === chooseNewHostUser())
    {
        ViewModel.IsHostUser = true;
        $("body").removeClass("nonHost").addClass("host");
        ViewModel.GameState.hostUserName = ViewModel.UserName;
        //TODO:  ViewModel.SignalHub.Broadcast({ type: "hostChanged", key: ViewModel.GameState.key, newHostUserName: ViewModel.GameState.hostUserName });
        ViewModel.Views.ParticipantsBox.Update();
    }

    // anounce via chat
    ViewModel.Views.ChatBox.Update(playerUserName + " has disconnected");
}

ViewModel.KickPlayer = (playerUserName) =>
{
    if (ViewModel.UserName === playerUserName)
    {
        window.onbeforeunload = null;
        window.location.href = "/";
        return;
    }
    ViewModel.GameState.players = deleteKey(ViewModel.GameState.players, playerUserName);
    if (ViewModel.GameState.status > 0)
    {
        var sentence = ViewModel.GetCurrentSentenceFor(playerUserName);
        ViewModel.GameState.sentences = deleteKey(ViewModel.GameState.sentences, sentence.id);
    }
    if (ViewModel.IsHostUser)
    {
        //TODO:  ViewModel.SignalHub.Broadcast({ type: "playerKicked", key: ViewModel.GameState.key, userName: playerUserName });
    }
    ViewModel.Views.ParticipantsBox.Update();
    ViewModel.Views.ChatBox.Update(playerUserName + " has been kicked");
    if (ViewModel.GameState.status > 0 && ViewModel.IsHostUser && ViewModel.Controller.GetCurrentUnsubmittedPlayers().length === 0)
    {
        ViewModel.Controller.StartNextPhrase();
    } else
    {
        ViewModel.ActivePage.Refresh();
    }
}

ViewModel.CreateRoom = (roomCode, userName) =>
{
    if (!userName) return;
    ViewModel.UserName = userName;
    ViewModel.RoomCode = roomCode;
    ViewModel.GameState =
        {};
    ViewModel.GameState.lang = ViewModel.DefaultLang;
    ViewModel.GameState.key = ViewModel.RandomCode() + ViewModel.RandomCode();
    ViewModel.GameState.hostUserName = ViewModel.UserName;
    ViewModel.GameState.players =
        {};
    //TODO: ViewModel.GameState.players[ViewModel.UserName] = ViewModel.SignalHub.GetConnectionId();
    ViewModel.GameState.status = 0;
    ViewModel.IsHostUser = true;
    $("body").removeClass("nonHost").addClass("host");
    //TODO: ViewModel.SignalHub.JoinRoom(ViewModel.RoomCode, ViewModel.GameState.key, () =>
    // {
    //     ViewModel.LoadPage(ViewModel.Views.LobbyPage);
    // });
}

ViewModel.SendJoinRequest = (roomCode, userName) =>
{
    if (!roomCode || !userName || ViewModel.JoinRequest !== null) return;
    ViewModel.JoinRequest =
        {
            type: "joinRequest",
            roomCode: roomCode,
            userName: userName
        };
    //TODO:  ViewModel.SignalHub.SendAndWait(roomCode, ViewModel.JoinRequest);
}

ViewModel.StartNewRound = (language) =>
{
    if (!ViewModel.IsHostUser) return;
    ViewModel.GameState.lang = language ? language : ViewModel.DefaultLang;
    ViewModel.GameState.sentences =
        {};
    for (var key in ViewModel.GameState.players)
    {
        if (!ViewModel.GameState.players.hasOwnProperty(key)) continue;
        var sentenceId = ViewModel.RandomCode();
        ViewModel.GameState.sentences[sentenceId] =
            { id: sentenceId, currentEditor: key };
    }
    ViewModel.GameState.status = 1;
    //TODO:  ViewModel.SignalHub.Broadcast({ type: "startRound", key: ViewModel.GameState.key, lang: ViewModel.GameState.lang, sentences: ViewModel.GameState.sentences });
    ViewModel.LoadPage(ViewModel.Views.WritePage);
}

ViewModel.StartNextPhrase = () =>
{
    if (!ViewModel.IsHostUser) return;
    var newAssignments = getNewSentenceAssignments();
    ViewModel.ApplyAssignments(newAssignments);
    ViewModel.GameState.status++;
    if (ViewModel.GameState.status > ViewModel.NumPhrases)
    {
        //TODO:  ViewModel.SignalHub.Broadcast({ type: "reveal", key: ViewModel.GameState.key, assignments: newAssignments });
        ViewModel.LoadPage(ViewModel.Views.RevealPage);
    } else
    {
        //TODO:  ViewModel.SignalHub.Broadcast({ type: "nextPhrase", key: ViewModel.GameState.key, assignments: newAssignments });
        ViewModel.LoadPage(ViewModel.Views.WritePage);
    }
}

ViewModel.GetCurrentSentenceFor = (userNameArg) =>
{
    for (var key in ViewModel.GameState.sentences)
    {
        if (!ViewModel.GameState.sentences.hasOwnProperty(key)) continue;
        var sentence = ViewModel.GameState.sentences[key];
        if (sentence.currentEditor === userNameArg) return sentence;
    }
    return null;
}

ViewModel.SubmitPhrase = (phrase) =>
{
    if (!phrase) return;
    console.log("phrase submitted: " + phrase);
    var sentence = ViewModel.Controller.GetCurrentSentenceFor(ViewModel.UserName);
    sentence["phrase" + ViewModel.GameState.status] = phrase;
    sentence["phrase" + ViewModel.GameState.status + "author"] = ViewModel.UserName;
    //TODO:  ViewModel.SignalHub.Broadcast({ type: "phraseSubmitted", key: ViewModel.GameState.key, value: phrase, sentenceId: sentence.id });
    if (ViewModel.IsHostUser && ViewModel.Controller.GetCurrentUnsubmittedPlayers().length === 0)
    {
        ViewModel.Controller.StartNextPhrase();
    } else
    {
        ViewModel.LoadPage(ViewModel.Views.PhraseSubmittedPage);
    }
}

ViewModel.IsCurrentPhraseSubmitted = () =>
{
    var sentence = ViewModel.Controller.GetCurrentSentenceFor(ViewModel.UserName);
    return !!sentence["phrase" + ViewModel.GameState.status];
}

ViewModel.GetCurrentUnsubmittedPlayers = () =>
{
    var players = [];
    for (var key in ViewModel.GameState.sentences)
    {
        if (!ViewModel.GameState.sentences.hasOwnProperty(key)) continue;
        var sentence = ViewModel.GameState.sentences[key];
        if (!sentence["phrase" + ViewModel.GameState.status])
        {
            players.push(sentence.currentEditor);
        }
    }
    return players;
}

ViewModel.RandomCode = () =>
{
    if (ViewModel.RandomCodeLength > 10) ViewModel.RandomCodeLength = 10;
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16).substring(10 - ViewModel.RandomCodeLength);
}

ViewModel.ValidateMessage = (message) =>
{
    var isValid = (!!ViewModel.GameState && ViewModel.GameState.key === message.key);
    if (!isValid)
    {
        ViewModel.Controller.LoadPage(ViewModel.Views.ErrorPage);
    }
    return isValid;
}

ViewModel.GetQueryParameter = (name) =>
{
    var url = window.location.href;
    name = name.replace(/[[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const getNewSentenceAssignments = () =>
{
    var ids = [];
    for (var key in ViewModel.GameState.sentences)
    {
        if (!ViewModel.GameState.sentences.hasOwnProperty(key)) continue;
        ids.push(ViewModel.GameState.sentences[key].id);
    }
    ids.sort();
    var assignments =
        {};
    for (var i = 0; i < ids.length; i++)
    {
        var index = i === 0 ? ids.length - 1 : i - 1;
        assignments[ids[i]] = ViewModel.GameState.sentences[ids[index]].currentEditor;
    }
    return assignments;
}

const deleteKey = (obj, keyToDelete) =>
{
    var newObj =
        {};
    for (var key in obj)
    {
        if (!obj.hasOwnProperty(key) || key === keyToDelete) continue;
        newObj[key] = obj[key];
    }
    return newObj;
}

const chooseNewHostUser = () =>
{
    var playerUserNames = [];
    for (var key in ViewModel.GameState.players)
    {
        if (!ViewModel.GameState.players.hasOwnProperty(key) || !ViewModel.GameState.players[key]) continue;
        playerUserNames.push(key);
    }
    playerUserNames.sort();
    return playerUserNames[0];
}

export default ViewModel;