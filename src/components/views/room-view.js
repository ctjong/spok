import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import ParticipantBox from '../roomControls/participant-box';
import ChatBox from '../roomControls/chat-box';
import LobbyPane from '../roomControls/lobby-pane';
import RevealPane from '../roomControls/reveal-pane';
import WaitPane from '../roomControls/wait-pane';
import WritePane from '../roomControls/write-pane';
import './room-view.css';


class RoomView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.state = ViewModel.GameState;
        this.roomCode = props.match.params.roomCode;
        this.userName = ViewModel.GetUserState("userName");
        this.isRoomView = true;
    }

    getActivePane()
    {
        switch(ViewModel.GameState.State)
        {
            case ViewModel.States.LOBBY:
                return <LobbyPane/>;
            case ViewModel.States.WRITE:
                let pane = <WaitPane/>;
                ViewModel.GameState.Papers.some((paper) => 
                {
                    if(paper.assignedTo === this.userName && paper.phrases.length < ViewModel.GameState.WriteStage)
                    {
                        pane = <WritePane/>;
                        return true;
                    }
                    return false;
                });
                return pane;
            case ViewModel.States.REVEAL:
                return <RevealPane/>;
        }
    }

    render() 
    {
        if(!ViewModel.GameState)
        {
            ViewModel.GoTo("/");
            return null;
        }

        return (
            <div className="view room-view">
                <h1>Room # {this.roomCode}</h1>
                {this.getActivePane()}
                <ParticipantBox players={this.state.Players}/>
                <ChatBox/>
            </div>
        );
    }
}

export default RoomView;