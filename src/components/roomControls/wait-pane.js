import React, { Component } from 'react';
import ViewModel from '../../view-model';
import Strings from '../../strings';
import { Part } from '../../models';
import './wait-pane.css';


class WaitPane extends Component
{
    handleSkipClick()
    {
        Object.keys(ViewModel.gameState.papers).forEach(paperId =>
        {
            const paper = ViewModel.gameState.papers[paperId];
            if(!paper.parts[ViewModel.gameState.activePart])
            {
                const randomArr = Strings[ViewModel.gameState.lang][`part${ViewModel.gameState.activePart}random`];
                const randomIdx = Math.floor(Math.random() * Math.floor(randomArr.length));
                const part = new Part(paperId, randomArr[randomIdx], null);
                ViewModel.handlePartSubmitted(part);
            }
        });
        ViewModel.activeView.updateUI();
    }

    render() 
    {
        const playerNames = [];
        Object.keys(ViewModel.gameState.players).forEach(userName => 
            {
                const paperId = ViewModel.gameState.players[userName].paperId;
                const paper = ViewModel.gameState.papers[paperId];
                if(paper && !paper.parts[ViewModel.gameState.activePart])
                    playerNames.push(userName);
            });
        const playerNamesJoined = playerNames.join(", ");

        const skipBtn = ViewModel.isHostUser() ? (
            <div>
                <button className="btn-box skip-btn" onClick={e => this.handleSkipClick()}>Ignore remaining players</button>
                <div className="note">(This will fill the papers that those people are holding with random texts)</div>
            </div>
        ) : null;

        return (
            <div className="pane wait-pane">
                <div>
                    <div>
                        <div>Now let’s wait for these losers:</div>
                        <div>{playerNamesJoined}</div>
                    </div>
                    <div className="waitList"></div>
                </div>
                {skipBtn}
            </div>
        );
    }
}

export default WaitPane;