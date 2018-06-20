import React from 'react';
import View from '../view-base';
import ViewModel from '../services/view-model';
import './submitted-view.css';


//-----------------------------
// View
//-----------------------------

class SubmittedView extends View
{
    render() 
    {
        return (
            <div className="view submitted-view">
                <h1><span className="user-name"></span>@<span className="room-code"></span></h1>
                <h2 className="sentence-id-heading">Sentence #<span className="sentence-id"></span></h2>
                <div>Your phrase has been submitted</div>
                <div>Waiting for:</div>
                <div className="waitList"></div>
            </div>
        );
    }
}

export default SubmittedView;