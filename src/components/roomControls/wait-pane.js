import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './wait-pane.css';


class WaitPane extends Component
{
    render() 
    {
        return (
            <div className="pane wait-pane">
                <h1><span className="user-name"></span>@<span className="room-code"></span></h1>
                <h2 className="paper-id-heading">Paper #<span className="paper-id"></span></h2>
                <div>Waiting for:</div>
                <div className="waitList"></div>
            </div>
        );
    }
}

export default WaitPane;