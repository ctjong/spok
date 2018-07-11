import React, { Component } from 'react';
import ClientHandler from '../../client-message-handler';
import { KickPlayerMessage, SetAsHostMessage } from '../../models';
import './participant-list.css';
import ClientSocket from '../../client-socket';


class ParticipantList extends Component
{
    handleKickButtonClick(player)
    {
        ClientSocket.send(new KickPlayerMessage(ClientHandler.roomCode, player.userName));
    }

    handleSetAsHostButtonClick(player)
    {
        ClientSocket.send(new SetAsHostMessage(ClientHandler.roomCode, player.userName));
    }

    getList()
    {
        const playerList = [];
        Object.keys(ClientHandler.getRoomState().players).forEach(userName => 
        {
            playerList.push(ClientHandler.getRoomState().players[userName]);
        });
        playerList.sort((a,b) => { return a.score < b.score; });

        const items = [];
        playerList.forEach(player =>
        {
            const className = "player " + (player.isOnline ? "" : "offline");
            const hostControls = ClientHandler.isHostUser() && ClientHandler.userName !== player.userName ? (
                <span>
                    (<a onClick={() => this.handleKickButtonClick(player)}>kick</a>)
                    (<a onClick={() => this.handleSetAsHostButtonClick(player)}>set as host</a>)
                </span>
            ) : null;
            const hostLabel = ClientHandler.getRoomState().hostUserName === player.userName ? (
                <span>(host)</span>
            ) : null;
            items.push(<div key={player.userName} className={className}>{player.userName} = {player.score} {hostLabel}{hostControls}</div>);
        });
        return items;
    }

    render() 
    {
        return (
            <div className="participant-list">
                <div><strong>Scores: </strong></div>
                <div className="scores">{this.getList()}</div>
            </div>
        );
    }
}

export default ParticipantList;