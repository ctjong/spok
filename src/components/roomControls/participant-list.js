import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './participant-list.css';


class ParticipantList extends Component
{
    render() 
    {
        const divs = [];
        Object.keys(ViewModel.gameState.players).forEach((userName) => 
        {
            const player = ViewModel.gameState.players[userName];
            const className = player.isOnline ? "" : "offline";
            divs.push(<div key={userName} className={className}>{userName}</div>);
        });

        return (
            <div className="participant-list">
                <h2>In the game</h2>
                <div className="participants">{divs}</div>
            </div>
        );
    }
}

export default ParticipantList;