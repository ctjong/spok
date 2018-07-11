import React from 'react';
import { Prompt } from 'react-router';
import ViewBase from '../../view-base';
import ClientHandler from '../../client-message-handler';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import ParticipantList from '../roomControls/participant-list';
import ChatBox from '../roomControls/chat-box';
import LobbyPane from '../roomControls/lobby-pane';
import RevealPane from '../roomControls/reveal-pane';
import WaitPane from '../roomControls/wait-pane';
import WritePane from '../roomControls/write-pane';
import Title from '../shared/title';
import RefreshButton from '../roomControls/refresh-button';
import { GoToLobbyMessage } from '../../models';
import './room-view.css';


class RoomView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.state = { room: null, isPromptDisabled: false, notifString: null };
        this.isRoomView = true;
        this.chatBox = null;
        ClientHandler.refreshState();
    }

    componentDidMount()
    {
        this.setState({ isPromptDisabled: false });
    }

    getActivePane()
    {
        switch(this.state.room.phase)
        {
            case Constants.phases.LOBBY:
                return <LobbyPane/>;
            case Constants.phases.WRITE:
                const player = this.state.room.players[ClientHandler.userName];
                if(!player)
                    return;
                const currentPaperId = player.paperId;
                const currentPaper = ClientHandler.getRoomState().papers[currentPaperId];
                if(currentPaper && !currentPaper.parts[this.state.room.activePart])
                    return <WritePane/>;
                else
                    return <WaitPane/>;
            case Constants.phases.REVEAL:
                return <RevealPane/>;
            default:
                return null;
        }
    }

    showNotifUI(notifString)
    {
        this.setState({ notifString });
    }

    hideNotifUI()
    {
        this.setState({ notifString: null });
    }

    disablePrompt()
    {
        this.setState({ isPromptDisabled: true });
    }

    updateRoomState(newState)
    {
        this.setState({ room: newState });
    }

    handleLobbyButtonClick()
    {
        ClientSocket.send(new GoToLobbyMessage(ClientHandler.roomCode));
    }

    render() 
    {
        const prompt = this.state.isPromptDisabled ? null : <Prompt message="Are you sure you want to leave?"/>;
        let body = null;
        if(this.state.notifString)
            body = <div>{this.state.notifString}</div>;
        else if(!this.state.room)
            body = <div>{Constants.notifStrings.CLIENT_DISCONNECTED}</div>;
        else
        {
            const lobbyBtn = ClientHandler.isHostUser() && ClientHandler.getRoomState().phase > Constants.phases.LOBBY ? (
                <button className="btn-box lobby-btn" onClick={() => this.handleLobbyButtonClick()}>Back to lobby</button>
            ) : null;
            body = (
                <div>
                    <RefreshButton />
                    {this.getActivePane()}
                    {lobbyBtn}
                    <ParticipantList/>
                    <ChatBox ref={el => this.chatBox = el}/>
                </div>
            );
        }

        return (
            <div className="view room-view">
                {prompt}
                <Title isLarge={false} />
                {body}
            </div>
        );
    }
}

export default RoomView;