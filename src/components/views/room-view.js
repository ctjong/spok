import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import Constants from '../../constants';
import ParticipantList from '../roomControls/participant-list';
import ChatBox from '../roomControls/chat-box';
import LobbyPane from '../roomControls/lobby-pane';
import RevealPane from '../roomControls/reveal-pane';
import WaitPane from '../roomControls/wait-pane';
import WritePane from '../roomControls/write-pane';
import TitleImg from '../../images/title.png';
import './room-view.css';


class RoomView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.state = ViewModel.gameState;
        this.roomCode = props.match.params.roomCode;
        this.isRoomView = true;
        this.chatBox = null;
    }

    updateUI()
    {
        this.setState(ViewModel.gameState);
    }

    getActivePane()
    {
        switch(this.state.phase)
        {
            case Constants.phases.LOBBY:
                return <LobbyPane/>;
            case Constants.phases.WRITE:
                const player = this.state.players[ViewModel.userName];
                if(!player)
                    return;
                const currentPaper = player.paper;
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
                <img src={TitleImg} alt="SPOK" className="title-small" />
                {this.getActivePane()}
                <ParticipantList/>
                <ChatBox ref={el => this.chatBox = el}/>
            </div>
        );
    }
}

export default RoomView;