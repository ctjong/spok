import React, { Component } from 'react';
import ViewModel from '../view-model';
import './participantbox.css';


//-----------------------------
// View
//-----------------------------

class ParticipantBox extends Component
{
    render() 
    {
        <div class="participantsBox">
            <h2>In the game</h2>
            <div class="participants"></div>
        </div>
    }
}

export default ParticipantBox;