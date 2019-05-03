import React from 'react';
import ViewBase from '../../view-base';
import ClientHandler from '../../client-message-handler';
import ClientSocket from '../../client-socket';
import Constants from '../../../constants';
import Title from '../shared/title';
import { JoinRequestMessage } from '../../../models';
import './join-view.css';


class JoinView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.roomCodeRef = React.createRef();
        this.userNameRef = React.createRef();
        this.isJoinView = true;
        this.state = { notifCode: null, isLoading: false };
    }

    handleSubmitClick()
    {
        const roomCode = this.roomCodeRef.current.value;
        const userName = this.userNameRef.current.value;

        this.setState({ isLoading: true });
        ClientHandler.setUserName(userName);
        ClientSocket.send(new JoinRequestMessage(roomCode, userName)).then(response =>
        {
            if(!response.isSuccess)
                this.setState({ isLoading: false, notifCode: response.notifCode });
            else
                ClientHandler.goTo(`/room/${roomCode}`);
        });
    }

    handleBackClick()
    {
        ClientHandler.goTo(Constants.HOME_PATH);
    }

    render() 
    {
        let body = null;
        if(this.state.isLoading)
            body = <div>Please wait</div>;
        else
        {
            body = (
                <div>
                    <div className="error">{Constants.notifStrings[this.state.notifCode]}</div>
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
            );
        }

        return(
            <div className="view join-view">
                <Title isLarge={true} />
                {body}
            </div>
        );
    }
}

export default JoinView;