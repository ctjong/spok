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
        this.state = { game: ViewModel.gameState, isHostUser: ViewModel.isHostUser };
        this.roomCode = props.match.params.roomCode;
        this.userName = ViewModel.getUserState(ViewModel.constants.USER_NAME);
        this.isRoomView = true;
    }

    syncStates()
    {
        this.setState({ game: ViewModel.gameState, isHostUser: ViewModel.isHostUser });
        ViewModel.sendToRoom(ViewModel.msg.types.STATE_UPDATE, ViewModel.msg.targets.OTHERS, this.state.game);
    }

    getActivePane()
    {
        switch(this.state.game.phase)
        {
            case ViewModel.phases.LOBBY:
                return <LobbyPane isHostUser={this.state.isHostUser}/>;
            case ViewModel.phases.WRITE:
                let pane = <WaitPane/>;
                this.state.game.papers.some((paper) => 
                {
                    if(paper.currentHolder.userName === this.userName && paper.parts.length < this.state.game.activePart)
                    {
                        pane = <WritePane/>;
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
        if(!this.state.game)
        {
            ViewModel.goTo("/");
            return null;
        }

        return (
            <div className="view room-view">
                <h1>Room # {this.roomCode}</h1>
                {this.getActivePane()}
                <ParticipantBox players={this.state.game.players}/>
                <ChatBox/>
            </div>
        );
    }
}

export default RoomView;