import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import './join-view.css';


class JoinView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.roomCodeRef = React.createRef();
        this.userNameRef = React.createRef();
    }

    handleSubmitClick()
    {
        const roomCode = this.roomCodeRef.current.value;
        const userName = this.userNameRef.current.value;
        ViewModel.socketSend(ViewModel.msg.types.JOIN_ROOM, ViewModel.msg.targets.HOST, roomCode, { userName }).then((response) => 
        {
            ViewModel.gameState = response.gameState;
            ViewModel.setUserState("roomCode", roomCode);
            ViewModel.setUserState("userName", userName);
            ViewModel.goTo(`/room/${roomCode}`);
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
                <div className="error"></div>
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