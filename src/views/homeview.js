import React, { Component } from 'react';
import ViewModel from '../view-model';
import './homeview.css';


//-----------------------------
// View
//-----------------------------

class HomeView extends Component
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
            <div class="page homePage">
                <h1>SPOK</h1>
                <button class="btn btn-success createBtn" onClick={e => this.handleCreateClick()}>Create session</button>
                <button class="btn btn-danger joinBtn" onClick={e => this.handleJoinClick()}>Join session</button>
                <button class="btn btn-primary howToBtn" onClick={e => this.handleHowToClick()}>How to play</button>
            </div>
        );
    }
}

export default HomeView;