import React from 'react';
import ViewBase from '../../view-base';
import Game from '../../game';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import Title from '../shared/title';
import { PlayerMessageData } from '../../models';
import './join-view.css';


class JoinView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.roomCodeRef = React.createRef();
        this.userNameRef = React.createRef();
        this.isJoinView = true;
        this.state = { errorString: null, isLoading: false };
    }

    handleSubmitClick()
    {
        const roomCode = this.roomCodeRef.current.value;
        const userName = this.userNameRef.current.value;

        ClientSocket.sendToId(Constants.msg.types.JOIN_REQUEST, roomCode, new PlayerMessageData(userName));
        this.setState({ isLoading: true });

        ClientSocket.addOneTimeHandler(
            Constants.msg.types.JOIN_RESPONSE, 
            (msg) =>
            {
                if(!msg.data.isSuccess)
                    this.setState({ isLoading: false, errorString: Constants.errorStrings[msg.data.err] });
                else
                {
                    Game.setRoomCode(roomCode);
                    Game.setUserName(userName);
                    Game.state = msg.data.gameState;
                    Game.goTo(`/room/${roomCode}`);
                }
            },
            Constants.JOIN_TIMEOUT,
            () => this.setState({ isLoading: false, errorString: Constants.errorStrings.requestTimedOut })
        );
    }

    handleBackClick()
    {
        Game.goTo("");
    }

    render() 
    {
        if(this.state.isLoading)
            return <div>Please wait</div>;

        return(
            <div className="view join-view">
                <Title isLarge={true} />
                <div>
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
                    <div className="note">
                        If you are trying to reconnect, please enter the same user name that you used previously.
                    </div>
                    <button className="btn-box submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
                    <button className="btn-box back-btn" onClick={e => this.handleBackClick()}>Back</button>
                </div>
            </div>
        );
    }
}

export default JoinView;