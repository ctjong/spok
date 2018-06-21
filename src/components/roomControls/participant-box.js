import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './participant-box.css';


class ParticipantBox extends Component
{
    render() 
    {
        const divs = [];
        Object.keys(this.props.players).forEach((userName) => 
        {
            divs.push(<div key={userName}>{userName}</div>);
        });

        return (
            <div className="participants-box">
                <h2>In the game</h2>
                <div className="participants">{divs}</div>
            </div>
        );
    }
}

export default ParticipantBox;