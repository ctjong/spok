import React from 'react';
import View from '../view';
import ViewModel from '../view-model';
import './lobbyview.css';


//-----------------------------
// View
//-----------------------------

class LobbyView extends View
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
            <div className="page lobbyPage">
                <h1>Room #<span className="roomCode"></span></h1>
                <div className="waitForHostText nonHostOnly">
                    Waiting for host to start the round
                </div>
                <div className="hostOnly">
                    <select className="langOptions"></select>
                    <div className="joinLinkSection">
                        <div>Share this link to your friends for joining this room:</div>
                        <div className="joinLink"></div>
                        <div>
                            <a target="_blank" href="" className="joinLinkWa" data-action="share/whatsapp/share"
                                onClick={e => this.handleWhatsappShareClick()}>
                                Share via Whatsapp
                            </a>
                        </div>
                    </div>
                    <button className="btn btn-success startBtn" onClick={e => this.handleStartClick()}>Start</button>
                </div>
            </div>
        );
    }
}

export default LobbyView;