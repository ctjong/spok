import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './lobby-pane.css';


class LobbyPane extends Component
{
    handleStartClick()
    {
        ViewModel.startRound();
    }

    render() 
    {
        const content = ViewModel.isHostUser() ? (
            <div>
                <button className="btn btn-success start-btn" onClick={e => this.handleStartClick()}>Start</button>
            </div>
        ) : (
            <div className="wait-for-host-text">
                Waiting for host to start the round
            </div>
        );

        return (
            <div className="pane lobby-pane">
                {content}
            </div>
        );
    }
}

export default LobbyPane;