import React from 'react';
import ViewBase from '../view-base';
import ViewModel from '../view-model';
import './home-view.css';


class HomeView extends ViewBase
{
    handleCreateClick()
    {
        ViewModel.GoTo("/create");
    }

    handleJoinClick()
    {
        ViewModel.GoTo("/join");
    }

    handleHowToClick()
    {
        ViewModel.GoTo("/howto");
    }

    render() 
    {
        return (
            <div className="view home-view">
                <h1>SPOK</h1>
                <button className="btn btn-success create-btn" onClick={e => this.handleCreateClick()}>Create session</button>
                <button className="btn btn-danger join-btn" onClick={e => this.handleJoinClick()}>Join session</button>
                <button className="btn btn-primary howto-btn" onClick={e => this.handleHowToClick()}>How to play</button>
            </div>
        );
    }
}

export default HomeView;