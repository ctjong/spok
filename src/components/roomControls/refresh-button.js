import React, { Component } from 'react';
import Game from '../../game';
import Constants from '../../constants';
import RefreshImg from '../../images/refresh.png';
import './refresh-button.css';


class RefreshButton extends Component
{
    handleRefreshClick()
    {
        Game.activeView.showErrorUI(Constants.errorStrings.syncingState);
        Game.refreshState();
    }

    render() 
    {
        return (
            <div className="refresh-btn" onClick={() => this.handleRefreshClick()}>
                <img src={RefreshImg} alt="refresh"/>
            </div>
        );
    }
}

export default RefreshButton;