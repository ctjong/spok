import React, { Component } from 'react';
import Game from '../../game';
import './participant-list.css';


class ParticipantList extends Component
{
    getList()
    {
        const playerList = [];
        Object.keys(Game.state.players).forEach(userName => 
        {
            playerList.push(Game.state.players[userName]);
        });
        playerList.sort((a,b) => { return a.score < b.score; });

        const items = [];
        playerList.forEach(player =>
        {
            const className = "player " + (player.isOnline ? "" : "offline");
            const kickButton = Game.isHostUser() && Game.userName !== player.userName ? (
                <span>(<a onClick={e => Game.kickPlayer(player)}>kick</a>)</span>
            ) : null;
            const hostLabel = Game.state.hostSocketId === player.socketId ? (
                <span>(host)</span>
            ) : null;
            items.push(<div key={player.userName} className={className}>{player.userName} = {player.score} {hostLabel}{kickButton}</div>);
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