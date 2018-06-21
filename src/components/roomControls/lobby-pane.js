import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './lobby-pane.css';


class LobbyPane extends Component
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

    getHostContent()
    {
        return (
            <div>
                <select className="lang-options"></select>
                <div className="join-link-section">
                    <div>Share this link to your friends for joining this room:</div>
                    <div className="join-link"></div>
                    <div>
                        <a target="_blank" className="join-link-wa" data-action="share/whatsapp/share"
                            onClick={e => this.handleWhatsappShareClick()}>
                            Share via Whatsapp
                        </a>
                    </div>
                </div>
                <button className="btn btn-success start-btn" onClick={e => this.handleStartClick()}>Start</button>
            </div>
        );
    }

    getNonHostContent()
    {
        return (
            <div className="wait-for-host-text">
                Waiting for host to start the round
            </div>
        );
    }

    render() 
    {
        return (
            <div className="pane lobby-pane">
                {this.props.isHostUser ? this.getHostContent() : this.getNonHostContent()}
            </div>
        );
    }
}

export default LobbyPane;