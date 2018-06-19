import React, { Component } from 'react';
import ViewModel from '../view-model';
import './revealview.css';


//-----------------------------
// View
//-----------------------------

class RevealView extends Component
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
            <div class="page revealPage">
                <h1><span class="userName"></span>@<span class="roomCode"></span></h1>
                <h2 class="sentenceIdHeading">Sentence #<span class="sentenceId"></span></h2>
                <h2 class="resultSentence"></h2>
                <div class="sentenceAuthors"></div>
                <div class="shareResultLinkDiv">
                    <a class="shareResultLink" onClick={this.handleChatShareClick()}>Share via chat</a>
                </div>
                <button class="btn btn-success newRoundBtn hostOnly" onClick={this.handleNewRoundClick()}>
                    New round
                </button>
                <button class="btn btn-danger endRoundBtn hostOnly" onClick={this.handleEndRoundClick()}>
                    Back to lobby
                </button>
                <div class="revealModeWaitText nonHostOnly"></div>
            </div>
        );
    }
}

export default RevealView;