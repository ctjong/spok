import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './participant-list.css';


class ParticipantList extends Component
{
    render() 
    {
        const items = [];
        Object.keys(ViewModel.gameState.players).forEach((userName) => 
        {
            const player = ViewModel.gameState.players[userName];
            const className = "player " + (player.isOnline ? "" : "offline");
            const kickButton = ViewModel.isHostUser() && ViewModel.userName !== userName ? (
                <span>(<a onClick={e => ViewModel.kickPlayer(player)}>kick</a>)</span>
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