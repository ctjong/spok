import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import './create-view.css';


class CreateView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.userNameRef = React.createRef();
    }

    handleSubmitClick()
    {
        const roomCode = ViewModel.getRandomCode().substring(0, 5);
        const userName = this.userNameRef.current.value;
        if(!userName)
            return;
        ClientSocket.sendToServer(Constants.msg.types.CREATE_ROOM, { roomCode }).then(() => 
        {
            ViewModel.setRoomCode(roomCode);
            ViewModel.setUserName(userName);
            ViewModel.initHostUser();
            ViewModel.goTo(`/room/${roomCode}`);
        });
    }

    handleBackClick()
    {
        ViewModel.goTo("");
    }

    render() 
    {
        return (
            <div className="view create-view">
                <h1>Create room</h1>
                <div className="form-inline">
                    <label>Your user name:</label>
                    <input type="text" className="input form-control" id="createPage_userName" ref={this.userNameRef}/>
                </div>
                <button className="btn btn-success submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
                <button className="btn btn-danger back-btn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default CreateView;