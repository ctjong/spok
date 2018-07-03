import React, { Component } from 'react';
import Game from '../../game';
import './lobby-pane.css';


class LobbyPane extends Component
{
    handleStartClick()
    {
        Game.startRound();
    }

    render() 
    {
        const content = Game.isHostUser() ? (
            <div>
                <button className="btn-box start-btn" onClick={e => this.handleStartClick()}>Start</button>
            </div>
        ) : (
            <div className="wait-for-host-text">
                Waiting for host to start the round
            </div>
        );

        return (
            <div className="pane lobby-pane">
                <div>
                    <h2>Room Code:</h2>
                    <div className="roomcode-large">{Game.roomCode}</div>
                </div>
                {content}
            </div>
        );
    }
}

export default LobbyPane;