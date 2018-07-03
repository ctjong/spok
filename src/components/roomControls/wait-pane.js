import React, { Component } from 'react';
import Game from '../../game';
import Strings from '../../strings';
import { Part } from '../../models';
import './wait-pane.css';


class WaitPane extends Component
{
    handleSkipClick()
    {
        Object.keys(Game.state.papers).forEach(paperId =>
        {
            const paper = Game.state.papers[paperId];
            if(!paper.parts[Game.state.activePart])
            {
                const randomArr = Strings[Game.state.lang][`part${Game.state.activePart}random`];
                const randomIdx = Math.floor(Math.random() * Math.floor(randomArr.length));
                const part = new Part(paperId, randomArr[randomIdx], null);
                Game.handlePartSubmitted(part);
            }
        });
        Game.activeView.updateUI();
    }

    render() 
    {
        const playerNames = [];
        Object.keys(Game.state.players).forEach(userName => 
            {
                const paperId = Game.state.players[userName].paperId;
                const paper = Game.state.papers[paperId];
                if(paper && !paper.parts[Game.state.activePart])
                    playerNames.push(userName);
            });
        const playerNamesJoined = playerNames.join(", ");

        const skipBtn = Game.isHostUser() ? (
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