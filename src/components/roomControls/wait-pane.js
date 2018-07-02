import React, { Component } from 'react';
import ViewModel from '../../view-model';
import Constants from '../../constants';
import { Part } from '../../models';
import './wait-pane.css';


class WaitPane extends Component
{
    handleSkipClick()
    {
        Object.keys(ViewModel.gameState.players).forEach(userName =>
        {
            const player = ViewModel.gameState.players[userName];
            if(player.paper && player.paper.parts.length < ViewModel.gameState.activePart)
                ViewModel.submitPart(new Part(Constants.SKIPPED_PART_STRING, player.userName));
        });
        ViewModel.activeView.updateUI();
    }

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

        const skipBtn = ViewModel.isHostUser() ? (
            <div>
                <button className="btn-block btn-box skip-btn" onClick={e => this.handleSkipClick()}>Ignore remaining players</button>
                <div className="note">(This will fill the papers that those people are holding with blank texts)</div>
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