import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './wait-pane.css';


class WaitPane extends Component
{
    render() 
    {
        const playerNames = [];
        Object.keys(ViewModel.gameState.players).forEach(userName => 
            {
                const paper = ViewModel.gameState.players[userName].paper;
                if(paper && paper.parts.length < ViewModel.gameState.activePart)
                    playerNames.push(userName);
            });
        const playerNamesJoined = playerNames.join(", ");

        return (
            <div className="pane wait-pane">
                <div>Waiting for: {playerNamesJoined}</div>
                <div className="waitList"></div>
            </div>
        );
    }
}

export default WaitPane;