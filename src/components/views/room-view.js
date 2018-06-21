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
        this.state = { game: ViewModel.GameState, isHostUser: ViewModel.IsHostUser };
        this.roomCode = props.match.params.roomCode;
        this.userName = ViewModel.GetUserState("userName");
        this.isRoomView = true;
    }

    syncStates()
    {
        this.setState({ game: ViewModel.GameState, isHostUser: ViewModel.IsHostUser });
        ViewModel.SendToRoom("stateUpdate", "others", this.state.game);
    }

    getActivePane()
    {
        switch(this.state.game.State)
        {
            case ViewModel.States.LOBBY:
                return <LobbyPane isHostUser={this.state.isHostUser}/>;
            case ViewModel.States.WRITE:
                let pane = <WaitPane/>;
                this.state.game.Papers.some((paper) => 
                {
                    if(paper.assignedTo === this.userName && paper.phrases.length < this.state.game.WriteStage)
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
        if(!this.state.game)
        {
            ViewModel.GoTo("/");
            return null;
        }

        return (
            <div className="view room-view">
                <h1>Room # {this.roomCode}</h1>
                {this.getActivePane()}
                <ParticipantBox players={this.state.game.Players}/>
                <ChatBox/>
            </div>
        );
    }
}

export default RoomView;