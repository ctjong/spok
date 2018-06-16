var Spok = Spok || {};

Spok.Strings = {
    "id": {
        "langName": "Bahasa Indonesia",
        "phrase1label": "Masukkan subjek",
        "phrase1placeholder": "Contoh: Joko, Widodo, Ahok, Andi, Budi",
        "phrase2label": "Masukkan kata kerja",
        "phrase2placeholder": "Contoh: membawa, menggendong, menjilat",
        "phrase3label": "Masukkan objek",
        "phrase3placeholder": "Contoh: bola, buah, hidung Andi, rambut Budi",
        "phrase4label": "Masukkan keterangan (tempat/waktu/dll)",
        "phrase4placeholder": "Contoh: di gunung, sampai puas, karena lelah",
    },
    "en": {
        "langName": "English",
        "phrase1label": "Enter a subject",
        "phrase1placeholder": "Examples: Ned, Catelyn, Robb, Obama",
        "phrase2label": "Enter a verb",
        "phrase2placeholder": "Examples: bring, eat, drink, look, enjoy",
        "phrase3label": "Enter an object",
        "phrase3placeholder": "Examples: ball, fruit, Ned's head, Jon's sword",
        "phrase4label": "Enter an adjective/adverb",
        "phrase4placeholder": "Examples: in the woods, until the end of time, while watching TV"
    }
}

Spok.DefaultLang = "en";
Spok.SignalHub = null;
Spok.Controller = null;
Spok.UserName = null;
Spok.RoomCode = null;
Spok.IsHostUser = false;
Spok.NumPhrases = 4;
Spok.RandomCodeLength = 5;
Spok.WaitTimeout = 5000;
Spok.JoinRequest = null;
Spok.ActivePage = null;
Spok.BaseUrl = window.location.href.replace(window.location.search, "");

Spok.GameState = null;

// entry point
$(function () {
    Spok.Controller = new Controller();
    Spok.SignalHub = new SignalHub();
    Spok.Controller.LoadPage(Spok.Views.LoadingPage);

    Spok.SignalHub.Initialize(function () {
        var actionParam = Spok.Controller.GetQueryParameter("action");
        if (actionParam === "join") {
            Spok.Controller.LoadPage(Spok.Views.JoinPage);
        } else if (actionParam === "create") {
            Spok.Controller.LoadPage(Spok.Views.CreatePage);
        } else if (actionParam === "howto") {
            Spok.Controller.LoadPage(Spok.Views.HowToPage);
        } else if (actionParam === "play") {
            var roomParam = Spok.Controller.GetQueryParameter("room");
            if (!!roomParam) {
                var userName = Spok.Controller.GetQueryParameter("user");
                if (!!userName) {
                    Spok.Controller.LoadPage(Spok.Views.LoadingPage);
                    if (sessionStorage["createRequested"] === "1") {
                        Spok.Controller.CreateRoom(roomParam, userName);
                        sessionStorage["createRequested"] = "0";
                    } else {
                        Spok.Controller.SendJoinRequest(roomParam, userName);
                    }
                } else {
                    Spok.Controller.LoadPage(Spok.Views.JoinPage);
                }
            } else {
                window.location.href = "?action=join";
            }
        }else{
            Spok.Controller.LoadPage(Spok.Views.HomePage);
        }
    });
});