import React from 'react';
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
        const roomCode = ViewModel.RandomCode();
        const userName = this.userNameRef.current.value;
        ViewModel.SendToServer("createRoom", { roomCode }).then(() => 
        {
            ViewModel.SetUserState("roomCode", roomCode);
            ViewModel.SetUserState("userName", userName);
            ViewModel.InitHostUser();
            ViewModel.GoTo("/lobby");
        });
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