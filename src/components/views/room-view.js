import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import Constants from '../../constants';
import ClientSocket from '../../client-socket';
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
        this.state = ViewModel.gameState;
        this.roomCode = props.match.params.roomCode;
        this.userName = ViewModel.getUserName();
        this.isRoomView = true;
    }

    syncStates()
    {
        this.setState(ViewModel.gameState);
        if(ViewModel.isHostUser())
            ClientSocket.sendToCurrentRoom(Constants.msg.types.STATE_UPDATE, ViewModel.gameState);
    }

    getActivePane()
    {
        switch(this.state.phase)
        {
            case Constants.phases.LOBBY:
                return <LobbyPane/>;
            case Constants.phases.WRITE:
                const currentPaper = this.state.players[this.userName].paper;
                if(currentPaper && currentPaper.parts.length < this.state.activePart)
                    return <WritePane/>;
                else
                    return <WaitPane/>;
            case Constants.phases.REVEAL:
                return <RevealPane/>;
            default:
                return null;
        }
    }

    render() 
    {
        if(!this.state)
        {
            ViewModel.goTo("/");
            return null;
        }

        return (
            <div className="view room-view">
                <h1>Room # {this.roomCode}</h1>
                {this.getActivePane()}
                <ParticipantBox players={this.state.players}/>
                <ChatBox/>
            </div>
        );
    }
}

export default RoomView;