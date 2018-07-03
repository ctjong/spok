import React from 'react';
import ViewBase from '../../view-base';
import Game from '../../game';
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
import RefreshButton from '../roomControls/refresh-button';
import './room-view.css';


class RoomView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.state = Game.state;
        this.chatBox = null;

        if(!this.state)
            this.tryToRejoin();
    }

    updateUI()
    {
        this.setState(Game.state);
    }

    getActivePane()
    {
        switch(this.state.phase)
        {
            case Constants.phases.LOBBY:
                return <LobbyPane/>;
            case Constants.phases.WRITE:
                const player = this.state.players[Game.userName];
                if(!player)
                    return;
                const currentPaperId = player.paperId;
                const currentPaper = Game.state.papers[currentPaperId];
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

    tryToRejoin()
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_REQUEST, Game.roomCode, new PlayerMessageData(Game.userName));
        ClientSocket.addOneTimeHandler(
            Constants.msg.types.JOIN_RESPONSE,
            (msg) =>
            {
                if(!msg.data.isSuccess)
                    Game.goTo("/");
                else
                {
                    Game.state = msg.data.gameState;
                    this.setState(msg.data.gameState);
                }
            }, 
            Constants.JOIN_TIMEOUT,
            () => Game.goTo("/")
        );
    }

    render() 
    {
        if(!this.state)
            return null;

        const refreshBtn = Game.isHostUser() ? null : <RefreshButton />;

        return (
            <div className="view room-view">
                <Title isLarge={false} />
                {refreshBtn}
                {this.getActivePane()}
                <ParticipantList/>
                <ChatBox ref={el => this.chatBox = el}/>
            </div>
        );
    }
}

export default RoomView;