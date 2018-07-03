import React, { Component } from 'react';
import Game from '../../game';
import './participant-list.css';


class ParticipantList extends Component
{
    render() 
    {
        const items = [];
        Object.keys(Game.state.players).forEach((userName) => 
        {
            const player = Game.state.players[userName];
            const className = "player " + (player.isOnline ? "" : "offline");
            const kickButton = Game.isHostUser() && Game.userName !== userName ? (
                <span>(<a onClick={e => Game.kickPlayer(player)}>kick</a>)</span>
            ) : null;

            items.push(<div key={userName} className={className}>{userName} {kickButton}</div>);
        });

        return (
            <div className="participant-list">
                <div><strong>In the game: </strong></div>
                {items}
            </div>
        );
    }
}

export default ParticipantList;