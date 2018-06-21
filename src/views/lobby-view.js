import React from 'react';
import ViewBase from '../view-base';
import ViewModel from '../view-model';
import ParticipantBox from '../widgets/participant-box';
import './lobby-view.css';


class LobbyView extends ViewBase
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
            <div className="view lobby-view">
                <h1>Room # {ViewModel.GetUserState("roomCode")}</h1>
                <div className="wait-for-host-text non-host-only">
                    Waiting for host to start the round
                </div>
                <div className="host-only">
                    <select className="lang-options"></select>
                    <div className="join-link-section">
                        <div>Share this link to your friends for joining this room:</div>
                        <div className="join-link"></div>
                        <div>
                            <a target="_blank" href="" className="join-link-wa" data-action="share/whatsapp/share"
                                onClick={e => this.handleWhatsappShareClick()}>
                                Share via Whatsapp
                            </a>
                        </div>
                    </div>
                    <button className="btn btn-success start-btn" onClick={e => this.handleStartClick()}>Start</button>
                </div>

                <ParticipantBox />
            </div>
        );
    }
}

export default LobbyView;