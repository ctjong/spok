import React from 'react';
import View from '../view';
import ViewModel from '../services/view-model';
import './joinview.css';


//-----------------------------
// View
//-----------------------------

class JoinView extends View
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
        ViewModel.GoTo("");
    }

    render() 
    {
        return(
            <div className="page joinPage">
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
                <button className="btn btn-success submitBtn" onClick={e => this.handleSubmitClick()}>Submit</button>
                <button className="btn btn-danger backBtn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default JoinView;