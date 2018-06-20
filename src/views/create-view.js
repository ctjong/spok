import React from 'react';
import io from 'socket.io-client';
import ViewBase from '../view-base';
import ViewModel from '../view-model';
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
        const userName = this.userNameRef.current.value;
        ViewModel.GameState = 
        {
            roomCode: ViewModel.RandomCode(),
            userName: userName
        };
        ViewModel.IsHostUser = true;
        ViewModel.Socket = io(`http://${window.location.hostname}`, 
        {
            query: { roomCode: ViewModel.GameState.roomCode }
        });
        ViewModel.GoTo("/lobby");
    }

    handleBackClick()
    {
        ViewModel.GoTo("");
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