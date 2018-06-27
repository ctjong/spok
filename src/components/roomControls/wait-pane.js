import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './wait-pane.css';


class WaitPane extends Component
{
    render() 
    {
        return (
            <div className="pane wait-pane">
                <div>Waiting for:</div>
                <div className="waitList"></div>
            </div>
        );
    }
}

export default WaitPane;