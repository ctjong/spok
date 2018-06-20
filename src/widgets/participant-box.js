import React, { Component } from 'react';
import ViewModel from '../services/view-model';
import './participant-box.css';


//-----------------------------
// View
//-----------------------------

class ParticipantBox extends Component
{
    render() 
    {
        <div className="participants-box">
            <h2>In the game</h2>
            <div className="participants"></div>
        </div>
    }
}

export default ParticipantBox;