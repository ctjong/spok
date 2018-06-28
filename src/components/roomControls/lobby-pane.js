import React, { Component } from 'react';
import ViewModel from '../../view-model';
import ClientSocket from '../../client-socket';
import Strings from '../../strings';
import './lobby-pane.css';


class LobbyPane extends Component
{
    constructor(props)
    {
        super(props);
        this.langSelectRef = React.createRef();
    }

    handleWhatsappShareClick()
    {
        //TODO
        // ViewModel.goTo("/create");
    }

    handleStartClick()
    {
        let lang = ViewModel.constants.DEFAULT_LANG;
        if(this.langSelectRef.current)
        {
            const dropdown = this.langSelectRef.current;
            const selectedIndex = dropdown.selectedIndex;
            lang = dropdown.options[selectedIndex].value;
        }
        ViewModel.startRound(lang);
    }

    getHostContent()
    {
        const options = [];
        Object.keys(Strings).forEach(lang => 
            {
                options.push(<option key={lang} value={lang}>{Strings[lang].langName}</option>)
            });

        return (
            <div>
                <div>
                    <label>Language: </label>
                    <select className="lang-options" ref={this.langSelectRef}>{options}</select>
                </div>
                <div className="join-link-section">
                    <div>Share this link to your friends for joining this room:</div>
                    <div className="join-link"></div>
                    <div>
                        <a target="_blank" onClick={e => this.handleWhatsappShareClick()}>
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
                {ViewModel.isHostUser() ? this.getHostContent() : this.getNonHostContent()}
            </div>
        );
    }
}

export default LobbyPane;