import React, { Component } from 'react';
import ViewModel from '../../view-model';
import Constants from '../../constants';
import './reveal-pane.css';
import ClientSocket from '../../client-socket';


class RevealPane extends Component
{
    handleNewRoundClick()
    {
        ViewModel.startRound(ViewModel.gameState.lang);
    }

    handleEndRoundClick()
    {
        ViewModel.gameState.phase = Constants.phases.LOBBY;
        ViewModel.activeView.updateUI();
        if(ViewModel.isHostUser())
            ClientSocket.sendToCurrentRoom(Constants.msg.types.GOTO_LOBBY);
    }

    render() 
    {
        const rows = [];
        Object.keys(ViewModel.gameState.players).forEach(userName => 
            {
                const player = ViewModel.gameState.players[userName];
                const texts = [];
                const paper = player.paper;
                if(paper)
                    paper.parts.forEach(part => texts.push(part.text));
                const textsJoined = texts.join(" ");
                rows.push(<div key={userName}>{textsJoined}</div>);
            });

        const bottomText = ViewModel.isHostUser() ? (
                <div>
                    <button className="btn btn-success new-round-btn" onClick={e => this.handleNewRoundClick(e)}>
                        New round
                    </button>
                    <button className="btn btn-danger end-round-btn" onClick={e => this.handleEndRoundClick(e)}>
                        Back to lobby
                    </button>
                </div>
            ) : (
                <div className="reveal-mode-wait-text">Waiting for host to take action</div>
            );

        return (
            <div className="pane reveal-pane">
                <div className="result-paper">{rows}</div>
                {bottomText}
            </div>
        );
    }
}

export default RevealPane;