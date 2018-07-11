import React, { Component } from 'react';
import ClientHandler from '../../client-message-handler';
import ClientSocket from '../../client-socket';
import Strings from '../../strings';
import { Part, SubmitPartMessage } from '../../models';
import './wait-pane.css';


class WaitPane extends Component
{
    handleSkipClick()
    {
        Object.keys(ClientHandler.getRoomState().papers).forEach(paperId =>
        {
            const paper = ClientHandler.getRoomState().papers[paperId];
            if(!paper.parts[ClientHandler.getRoomState().activePart])
            {
                const randomArr = Strings[ClientHandler.getRoomState().lang][`part${ClientHandler.getRoomState().activePart}random`];
                const randomIdx = Math.floor(Math.random() * Math.floor(randomArr.length));
                const part = new Part(paperId, randomArr[randomIdx], null);
                ClientSocket.send(new SubmitPartMessage(ClientHandler.roomCode, part));
            }
        });
    }

    render() 
    {
        const playerNames = [];
        Object.keys(ClientHandler.getRoomState().players).forEach(userName => 
            {
                const paperId = ClientHandler.getRoomState().players[userName].paperId;
                const paper = ClientHandler.getRoomState().papers[paperId];
                if(paper && !paper.parts[ClientHandler.getRoomState().activePart])
                    playerNames.push(userName);
            });
        const playerNamesJoined = playerNames.join(", ");

        const skipBtn = ClientHandler.isHostUser() ? (
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