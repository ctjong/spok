import React from 'react';
import ViewModel from '../../view-model';
import './submitted-pane.css';


class SubmittedPane
{
    render() 
    {
        return (
            <div className="pane submitted-pane">
                <h1><span className="user-name"></span>@<span className="room-code"></span></h1>
                <h2 className="paper-id-heading">Paper #<span className="paper-id"></span></h2>
                <div>Your phrase has been submitted</div>
                <div>Waiting for:</div>
                <div className="waitList"></div>
            </div>
        );
    }
}

export default SubmittedPane;