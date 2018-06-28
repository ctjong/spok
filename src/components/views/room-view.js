import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
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
        this.userName = ViewModel.getUserState(ViewModel.constants.USER_NAME);
        this.isRoomView = true;
    }

    syncStates()
    {
        this.setState(ViewModel.gameState);
        if(ViewModel.isHostUser())
            ClientSocket.sendToCurrentRoom(ClientSocket.msg.types.STATE_UPDATE, ViewModel.gameState);
    }

    handlePartSubmit(part)
    {

    }

    getActivePane()
    {
        switch(this.state.phase)
        {
            case ViewModel.phases.LOBBY:
                return <LobbyPane/>;
            case ViewModel.phases.WRITE:
                let pane = <WaitPane/>;
                this.state.papers.some((paper) => 
                {
                    if(paper.currentHolder.userName === this.userName && paper.parts.length < this.state.activePart)
                    {
                        pane = <WritePane activePart={this.state.activePart} lang={this.state.lang} handleSubmit={p => this.handlePartSubmit(p)}/>;
                        return true;
                    }
                    return false;
                });
                return pane;
            case ViewModel.phases.REVEAL:
                return <RevealPane/>;
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