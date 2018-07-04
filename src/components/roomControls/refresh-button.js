import React, { Component } from 'react';
import Game from '../../game';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import RefreshImg from '../../images/refresh.png';
import LoadingImg from '../../images/loading.gif';
import './refresh-button.css';


class RefreshButton extends Component
{
    constructor(props)
    {
        super(props);
        this.state = { isLoading: false };
    }

    handleRefreshClick()
    {
        ClientSocket.sendToId(Constants.msg.types.STATE_REQUEST, Game.state.hostSocketId);
        ClientSocket.addOneTimeHandler(
            Constants.msg.types.STATE_UPDATE,
            () => this.setState({ isLoading: false }), 
            Constants.REQUEST_TIMEOUT,
            () =>
            {
                ClientSocket.reset();
                Game.tryToRejoin();
                this.setState({ isLoading: false });
            }
        );
        this.setState({ isLoading: true });
    }

    render() 
    {
        if(this.state.isLoading)
        {
            return (
                <div className="refresh-loading">
                    <img src={LoadingImg} alt="loading" />
                </div>
            );
        }

        return (
            <div className="refresh-btn" onClick={() => this.handleRefreshClick()}>
                <img src={RefreshImg} alt="refresh"/>
            </div>
        );
    }
}

export default RefreshButton;