import React from 'react';
import ViewBase from '../../view-base';
import Game from '../../game';
import Title from '../shared/title';
import './home-view.css';


class HomeView extends ViewBase
{
    handleCreateClick()
    {
        Game.goTo("/create");
    }

    handleJoinClick()
    {
        Game.goTo("/join");
    }

    handleHowToClick()
    {
        Game.goTo("/howto");
    }

    render() 
    {

        return (
            <div className="view home-view">
                <Title isLarge={true} />
                <button className="btn-box create-btn" onClick={e => this.handleCreateClick()}>Create room</button>
                <button className="btn-box join-btn" onClick={e => this.handleJoinClick()}>Join room</button>
                <button className="btn-box howto-btn" onClick={e => this.handleHowToClick()}>How to play</button>
            </div>
        );
    }
}

export default HomeView;