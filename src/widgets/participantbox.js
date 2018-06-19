import React, { Component } from 'react';
import ViewModel from '../services/view-model';
import './participantbox.css';


//-----------------------------
// View
//-----------------------------

class ParticipantBox extends Component
{
    render() 
    {
        <div className="participantsBox">
            <h2>In the game</h2>
            <div className="participants"></div>
        </div>
    }
}

export default ParticipantBox;