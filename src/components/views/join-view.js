import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import './join-view.css';
import { PlayerMessageData } from '../../models';


class JoinView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.roomCodeRef = React.createRef();
        this.userNameRef = React.createRef();
        this.state = { errorString: null };
    }

    handleSubmitClick()
    {
        const roomCode = this.roomCodeRef.current.value;
        const userName = this.userNameRef.current.value;
        ClientSocket.sendToId(Constants.msg.types.JOIN_REQUEST, roomCode, new PlayerMessageData(userName), 
            Constants.msg.types.JOIN_RESPONSE).then((msg) =>
        {
            if(!msg.data.isSuccess)
                this.setState({ errorString: Constants.errorStrings[msg.data.err] });
            else
            {
                ViewModel.initNonHostUser(roomCode, userName, msg.data.gameState);
                ViewModel.goTo(`/room/${roomCode}`);
            }
        });
    }

    handleBackClick()
    {
        ViewModel.goTo("");
    }

    render() 
    {
        return(
            <div className="view join-view">
                <h1>Join room</h1>
                <div className="error">{this.state.errorString}</div>
                <div className="form-inline">
                    <label>Room code:</label>
                    <input type="text" className="input form-control" id="joinPage_roomCode" ref={this.roomCodeRef}/>
                </div>
                <div className="form-inline">
                    <label>Your user name:</label>
                    <input type="text" className="input form-control" id="joinPage_userName" ref={this.userNameRef}/>
                </div>
                <button className="btn btn-success submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
                <button className="btn btn-danger back-btn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default JoinView;