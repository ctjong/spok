import React, { Component } from 'react';
import ViewModel from '../view-model';
import './joinview.css';


//-----------------------------
// View
//-----------------------------

class JoinView extends Component
{
    constructor(props)
    {
        super(props);
        this.roomCodeRef = React.createRef();
        this.userNameRef = React.createRef();
    }

    handleSubmitClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    handleBackClick()
    {
        ViewModel.GoTo("/");
    }

    render() 
    {
        return(
            <div class="page joinPage">
                <h1>Join room</h1>
                <div class="error"></div>
                <div class="form-inline">
                    <label>Room code:</label>
                    <input type="text" class="input form-control" id="joinPage_roomCode" ref={this.roomCodeRef}/>
                </div>
                <div class="form-inline">
                    <label>Your user name:</label>
                    <input type="text" class="input form-control" id="joinPage_userName" ref={this.userNameRef}/>
                </div>
                <button class="btn btn-success submitBtn" onClick={e => this.handleSubmitClick()}>Submit</button>
                <button class="btn btn-danger backBtn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default JoinView;