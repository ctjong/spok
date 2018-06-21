import React from 'react';
import ViewBase from '../view-base';
import ViewModel from '../view-model';
import './submitted-view.css';


class SubmittedView extends ViewBase
{
    render() 
    {
        return (
            <div className="view submitted-view">
                <h1><span className="user-name"></span>@<span className="room-code"></span></h1>
                <h2 className="paper-id-heading">Paper #<span className="paper-id"></span></h2>
                <div>Your phrase has been submitted</div>
                <div>Waiting for:</div>
                <div className="waitList"></div>
            </div>
        );
    }
}

export default SubmittedView;