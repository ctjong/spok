import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import ParticipantBox from '../roomControls/participant-box';
import ChatBox from '../roomControls/chat-box';
import LobbyPane from '../roomControls/lobby-pane';
import RevealPane from '../roomControls/reveal-pane';
import SubmittedPane from '../roomControls/submitted-pane';
import WritePane from '../roomControls/write-pane';
import './room-view.css';


class RoomView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.state = ViewModel.GameState;
        this.roomCode = props.match.params.roomCode;
    }

    getActivePane()
    {
        switch(ViewModel.GameState.state)
        {
            case ViewModel.States.LOBBY:
                return <LobbyPane/>;
        }
    }

    render() 
    {
        return (
            <div className="view room-view">
                <h1>Room # {this.roomCode}</h1>

                <ParticipantBox/>
                <ChatBox/>
            </div>
        );
    }
}

export default RoomView;