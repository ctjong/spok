import React from 'react';
import View from '../view';
import ViewModel from '../services/view-model';
import './submittedview.css';


//-----------------------------
// View
//-----------------------------

class SubmittedView extends View
{
    render() 
    {
        return (
            <div className="page phraseSubmittedPage">
                <h1><span className="userName"></span>@<span className="roomCode"></span></h1>
                <h2 className="sentenceIdHeading">Sentence #<span className="sentenceId"></span></h2>
                <div>Your phrase has been submitted</div>
                <div>Waiting for:</div>
                <div className="waitList"></div>
            </div>
        );
    }
}

export default SubmittedView;