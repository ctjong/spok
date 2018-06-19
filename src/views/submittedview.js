import React, { Component } from 'react';
import ViewModel from '../view-model';
import './submittedview.css';


//-----------------------------
// View
//-----------------------------

class SubmittedView extends Component
{
    render() 
    {
        return (
            <div class="page phraseSubmittedPage">
                <h1><span class="userName"></span>@<span class="roomCode"></span></h1>
                <h2 class="sentenceIdHeading">Sentence #<span class="sentenceId"></span></h2>
                <div>Your phrase has been submitted</div>
                <div>Waiting for:</div>
                <div class="waitList"></div>
            </div>
        );
    }
}

export default SubmittedView;