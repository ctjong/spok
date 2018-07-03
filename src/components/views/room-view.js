import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import ParticipantList from '../roomControls/participant-list';
import ChatBox from '../roomControls/chat-box';
import LobbyPane from '../roomControls/lobby-pane';
import RevealPane from '../roomControls/reveal-pane';
import WaitPane from '../roomControls/wait-pane';
import WritePane from '../roomControls/write-pane';
import Title from '../shared/title';
import { PlayerMessageData } from '../../models';
import './room-view.css';


class RoomView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.state = ViewModel.gameState;
        this.chatBox = null;

        if(!this.state)
            this.tryToRejoin();
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
                const currentPaperId = player.paperId;
                const currentPaper = ViewModel.gameState.papers[currentPaperId];
                if(currentPaper && !currentPaper.parts[this.state.activePart])
                    return <WritePane/>;
                else
                    return <WaitPane/>;
            case Constants.phases.REVEAL:
                return <RevealPane/>;
            default:
                return null;
        }
    }

    handleRefreshClick()
    {
        ClientSocket.sendToId(Constants.msg.types.STATE_REQUEST, ViewModel.gameState.hostSocketId);
        ClientSocket.addOneTimeHandler(Constants.msg.types.STATE_UPDATE, null, () =>
        {
            ClientSocket.reset();
            this.tryToRejoin();
        });
    }

    tryToRejoin()
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_REQUEST, ViewModel.roomCode, new PlayerMessageData(ViewModel.userName));
        ClientSocket.addOneTimeHandler(Constants.msg.types.JOIN_RESPONSE, (msg) =>
        {
            if(!msg.data.isSuccess)
                ViewModel.goTo("/");
            else
            {
                ViewModel.gameState = msg.data.gameState;
                this.setState(msg.data.gameState);
            }
        }, () => ViewModel.goTo("/"));
    }

    render() 
    {
        if(!this.state)
            return null;

        const refreshBtn = ViewModel.isHostUser() ? null : (
            <button className="btn-box refresh-btn" onClick={e => this.handleRefreshClick()}>Refresh</button>
        );

        return (
            <div className="view room-view">
                <Title isLarge={false} />
                {this.getActivePane()}
                {refreshBtn}
                <ParticipantList/>
                <ChatBox ref={el => this.chatBox = el}/>
            </div>
        );
    }
}

export default RoomView;