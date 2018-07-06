import React from 'react';
import { Prompt } from 'react-router';
import ViewBase from '../../view-base';
import Game from '../../game';
import Constants from '../../constants';
import ParticipantList from '../roomControls/participant-list';
import ChatBox from '../roomControls/chat-box';
import LobbyPane from '../roomControls/lobby-pane';
import RevealPane from '../roomControls/reveal-pane';
import WaitPane from '../roomControls/wait-pane';
import WritePane from '../roomControls/write-pane';
import Title from '../shared/title';
import RefreshButton from '../roomControls/refresh-button';
import './room-view.css';


class RoomView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.state = { game: Game.state, isPromptDisabled: false, errorCode: null };
        this.isRoomView = true;
        this.chatBox = null;

        if(!Game.state)
            Game.refreshState();
    }

    componentDidMount()
    {
        this.setState({ isPromptDisabled: false });
    }

    updateUI()
    {
        this.setState({ game: Game.state });
    }

    getActivePane()
    {
        switch(this.state.game.phase)
        {
            case Constants.phases.LOBBY:
                return <LobbyPane/>;
            case Constants.phases.WRITE:
                const player = this.state.game.players[Game.userName];
                if(!player)
                    return;
                const currentPaperId = player.paperId;
                const currentPaper = Game.state.papers[currentPaperId];
                if(currentPaper && !currentPaper.parts[this.state.game.activePart])
                    return <WritePane/>;
                else
                    return <WaitPane/>;
            case Constants.phases.REVEAL:
                return <RevealPane/>;
            default:
                return null;
        }
    }

    showErrorUI(errorCode)
    {
        this.setState({ errorCode });
    }

    hideErrorUI()
    {
        this.setState({ errorCode: null });
    }

    disablePrompt()
    {
        this.setState({ isPromptDisabled: true });
    }

    render() 
    {
        if(!this.state.game)
            return null;

        if(this.state.isDisconnected)
            return <div>You are disconnected. Please wait while we try to reconnect you</div>;

        const prompt = this.state.isPromptDisabled ? null : <Prompt message="Are you sure you want to leave?"/>;
        const refreshBtn = Game.isHostUser() ? null : <RefreshButton />;
        const lobbyBtn = Game.state.phase > Constants.phases.LOBBY ? (
            <button className="btn-box lobby-btn" onClick={e => Game.goToLobby()}>Back to lobby</button>
        ) : null;

        return (
            <div className="view room-view">
                {prompt}
                <Title isLarge={false} />
                {refreshBtn}
                {this.getActivePane()}
                {lobbyBtn}
                <ParticipantList/>
                <ChatBox ref={el => this.chatBox = el}/>
            </div>
        );
    }
}

export default RoomView;