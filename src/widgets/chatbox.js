import React, { Component } from 'react';
import ViewModel from '../services/view-model';
import './chatbox.css';


//-----------------------------
// View
//-----------------------------

class ChatBox extends Component
{
    handleSendClick()
    {
        //TODO
    }

    handleClearClick()
    {
        //TODO
    }

    render() 
    {
        <div className="chatbox">
            <h2>Chat</h2>
            <div className="chatbox-chats"><div className="chatbox-innerchats"></div></div>
            <input type="text" placeholder="type a message" className="form-control chatbox-input" />
            <button className="btn btn-primary chat-send" onClick={e => this.handleSendClick()}>Send</button>
            <button className="btn btn-danger chat-clear" onClick={e => this.handleClearClick()}>Clear</button>
        </div>
    }
}

export default ChatBox;