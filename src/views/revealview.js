import React from 'react';
import View from '../view';
import ViewModel from '../services/view-model';
import './revealview.css';


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
            <div className="page revealPage">
                <h1><span className="userName"></span>@<span className="roomCode"></span></h1>
                <h2 className="sentenceIdHeading">Sentence #<span className="sentenceId"></span></h2>
                <h2 className="resultSentence"></h2>
                <div className="sentenceAuthors"></div>
                <div className="shareResultLinkDiv">
                    <a className="shareResultLink" onClick={this.handleChatShareClick()}>Share via chat</a>
                </div>
                <button className="btn btn-success newRoundBtn hostOnly" onClick={this.handleNewRoundClick()}>
                    New round
                </button>
                <button className="btn btn-danger endRoundBtn hostOnly" onClick={this.handleEndRoundClick()}>
                    Back to lobby
                </button>
                <div className="revealModeWaitText nonHostOnly"></div>
            </div>
        );
    }
}

export default RevealView;