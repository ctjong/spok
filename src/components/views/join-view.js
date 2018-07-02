import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import TitleImg from '../../images/title.png';
import { PlayerMessageData } from '../../models';
import './join-view.css';


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
                <img src={TitleImg} alt="SPOK" className="title-large" />
                <div className="error">{this.state.errorString}</div>
                <div className="control-group">
                    <div>
                        <label>Room code:</label>
                    </div>
                    <div>
                        <input type="text" className="input" id="joinPage_roomCode" ref={this.roomCodeRef}/>
                    </div>
                </div>
                <div className="control-group">
                    <div>
                        <label>Your user name:</label>
                    </div>
                    <div>
                        <input type="text" className="input" id="joinPage_userName" ref={this.userNameRef}/>
                    </div>
                </div>
                <button className="btn-box submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
                <button className="btn-box back-btn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default JoinView;