import React from 'react';
import View from '../view';
import ViewModel from '../services/view-model';
import './homeview.css';


//-----------------------------
// View
//-----------------------------

class HomeView extends View
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
            <div className="page homePage">
                <h1>SPOK</h1>
                <button className="btn btn-success createBtn" onClick={e => this.handleCreateClick()}>Create session</button>
                <button className="btn btn-danger joinBtn" onClick={e => this.handleJoinClick()}>Join session</button>
                <button className="btn btn-primary howToBtn" onClick={e => this.handleHowToClick()}>How to play</button>
            </div>
        );
    }
}

export default HomeView;