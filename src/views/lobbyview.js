import React, { Component } from 'react';
import ViewModel from '../view-model';
import './lobbyview.css';


//-----------------------------
// View
//-----------------------------

class LobbyView extends Component
{
    handleWhatsappShareClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    handleStartClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    render() 
    {
        return (
            <div class="page lobbyPage">
                <h1>Room #<span class="roomCode"></span></h1>
                <div class="waitForHostText nonHostOnly">
                    Waiting for host to start the round
                </div>
                <div class="hostOnly">
                    <select class="langOptions"></select>
                    <div class="joinLinkSection">
                        <div>Share this link to your friends for joining this room:</div>
                        <div class="joinLink"></div>
                        <div>
                            <a target="_blank" href="" class="joinLinkWa" data-action="share/whatsapp/share"
                                onClick={e => this.handleWhatsappShareClick()}>
                                Share via Whatsapp
                            </a>
                        </div>
                    </div>
                    <button class="btn btn-success startBtn" onClick={e => this.handleStartClick()}>Start</button>
                </div>
            </div>
        );
    }
}

export default LobbyView;