import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import TitleImg from '../../images/title.png';
import './home-view.css';


class HomeView extends ViewBase
{
    handleCreateClick()
    {
        ViewModel.goTo("/create");
    }

    handleJoinClick()
    {
        ViewModel.goTo("/join");
    }

    handleHowToClick()
    {
        ViewModel.goTo("/howto");
    }

    render() 
    {

        return (
            <div className="view home-view">
                <img src={TitleImg} alt="SPOK" className="title-large" />
                <button className="btn-box create-btn" onClick={e => this.handleCreateClick()}>Create room</button>
                <button className="btn-box join-btn" onClick={e => this.handleJoinClick()}>Join room</button>
                <button className="btn-box howto-btn" onClick={e => this.handleHowToClick()}>How to play</button>
            </div>
        );
    }
}

export default HomeView;