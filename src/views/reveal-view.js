import React from 'react';
import View from '../view-base';
import ViewModel from '../services/view-model';
import './reveal-view.css';


//-----------------------------
// View
//-----------------------------

class RevealView extends View
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
            <div className="view reveal-view">
                <h1><span className="user-name"></span>@<span className="room-code"></span></h1>
                <h2 className="sentence-id-heading">Sentence #<span className="sentence-id"></span></h2>
                <h2 className="result-sentence"></h2>
                <div className="sentence-authors"></div>
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

export default RevealView;