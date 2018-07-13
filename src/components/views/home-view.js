import React from 'react';
import ViewBase from '../../view-base';
import Constants from '../../constants';
import ClientHandler from '../../client-message-handler';
import Title from '../shared/title';
import './home-view.css';


class HomeView extends ViewBase
{
    handleCreateClick()
    {
        ClientHandler.goTo("/create");
    }

    handleJoinClick()
    {
        ClientHandler.goTo("/join");
    }

    handleHowToClick()
    {
        ClientHandler.goTo("/howto");
    }

    render() 
    {
        const errorBanner = !ClientHandler.lastNotifCode ? null : (
            <div className="error">{Constants.notifStrings[ClientHandler.lastNotifCode]}</div>
        );
        return (
            <div className="view home-view">
                <Title isLarge={true} />
                {errorBanner}
                <button className="btn-box create-btn" onClick={e => this.handleCreateClick()}>Create room</button>
                <button className="btn-box join-btn" onClick={e => this.handleJoinClick()}>Join room</button>
                <button className="btn-box howto-btn" onClick={e => this.handleHowToClick()}>How to play</button>
            </div>
        );
    }
}

export default HomeView;