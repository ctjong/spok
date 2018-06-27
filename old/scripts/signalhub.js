function SignalHub() {
    var instance = this;
    var hub = null;
    var waitTimers = {};

    function receive(message) {
        console.log("received:");
        console.log(message);
        var jsonMsg = JSON.parse(message);
        if (!jsonMsg) {
            console.log("failed to parse received message.");
            return;
        }
        if (!!jsonMsg.waitId) {
            var timer = waitTimers[jsonMsg.waitId];
            if (!!timer) {
                clearTimeout(timer);
                waitTimers[jsonMsg.waitId] = null;
            }
        }
        Spok.MessageHandlers[jsonMsg.type].Execute(jsonMsg);
    }

    function signalBroadcast(roomCode, jsonMsg) {
        console.log("broadcasting to " + roomCode + ":");
        console.log(jsonMsg);
        hub.server.broadcast(roomCode, JSON.stringify(jsonMsg));
    }

    function signalSend(connectionId, jsonMsg) {
        console.log("sending to " + connectionId + ":");
        console.log(jsonMsg);
        hub.server.send(connectionId, JSON.stringify(jsonMsg));
    }

    this.GetConnectionId = function () {
        return $.connection.hub.id;
    }

    this.JoinRoom = function (roomCode, roomKey, callback) {
        Spok.RoomCode = roomCode;
        hub.server.joinRoom(roomCode, roomKey).done(function () {
            callback();
        });
    }

    this.LeaveRoom = function (roomCode, callback) {
        Spok.RoomCode = null;
        hub.server.leaveRoom(roomCode).done(callback);
    }

    this.SendAndWait = function (target, jsonMsg) {
        var timer = setTimeout(function () {
            Spok.MessageHandlers["timeout"].Execute({ type: "timeout", request: jsonMsg });
        }, Spok.WaitTimeout);
        var waitId = Spok.Controller.RandomCode();
        waitTimers[waitId] = timer;
        jsonMsg.connectionId = instance.GetConnectionId();
        jsonMsg.waitId = waitId;
        if (target.length > Spok.randomCodeLength) {
            signalSend(target, jsonMsg);
        } else {
            signalBroadcast(target, jsonMsg);
        }
    }

    this.Reply = function (request, response) {
        response.waitId = request.waitId;
        signalSend(request.connectionId, response);
    }

    this.Broadcast = function (jsonMsg) {
        if (Spok.RoomCode === null) return;
        signalBroadcast(Spok.RoomCode, jsonMsg);
    }

    this.Initialize = function (callback) {
        hub = $.connection.signalHub;
        hub.client.broadcastMessage = function (message) {
            receive(message);
        }
        hub.client.connectionLost = function (connectionId) {
            console.log("got connection lost signal for " + connectionId);
            Spok.Controller.OnDisconnectSignal(connectionId);
        }
        hub.client.errorOccurred = function (message) {
            console.log("got error occurred signal with message: '" + message + "'");
            Spok.Controller.LoadPage(Spok.Views.ErrorPage);
        }
        $.connection.hub.start().done(function () {
            callback();
        });
    }
}