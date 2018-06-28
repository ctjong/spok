import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
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
                <h1>SPOK</h1>
                <button className="btn btn-success create-btn" onClick={e => this.handleCreateClick()}>Create room</button>
                <button className="btn btn-danger join-btn" onClick={e => this.handleJoinClick()}>Join room</button>
                <button className="btn btn-primary howto-btn" onClick={e => this.handleHowToClick()}>How to play</button>
            </div>
        );
    }
}

export default HomeView;