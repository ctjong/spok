import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './reveal-pane.css';


class RevealPane extends Component
{
    handleChatShareClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    handleNewRoundClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    handleEndRoundClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    render() 
    {
        return (
            <div className="pane reveal-pane">
                <h1><span className="user-name"></span>@<span className="room-code"></span></h1>
                <h2 className="paper-id-heading">Paper #<span className="paper-id"></span></h2>
                <h2 className="result-paper"></h2>
                <div className="paper-authors"></div>
                <div className="share-result-link-div">
                    <a className="share-result-link" onClick={this.handleChatShareClick()}>Share via chat</a>
                </div>
                <button className="btn btn-success new-round-btn host-only" onClick={this.handleNewRoundClick()}>
                    New round
                </button>
                <button className="btn btn-danger end-round-btn host-only" onClick={this.handleEndRoundClick()}>
                    Back to lobby
                </button>
                <div className="reveal-mode-wait-text non-host-only"></div>
            </div>
        );
    }
}

export default RevealPane;