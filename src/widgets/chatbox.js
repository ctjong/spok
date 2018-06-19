import React, { Component } from 'react';
import ViewModel from '../view-model';
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
        <div class="chatbox">
            <h2>Chat</h2>
            <div class="chatbox-chats"><div class="chatbox-innerchats"></div></div>
            <input type="text" placeholder="type a message" class="form-control chatbox-input" />
            <button class="btn btn-primary chat-send" onClick={e => this.handleSendClick()}>Send</button>
            <button class="btn btn-danger chat-clear" onClick={e => this.handleClearClick()}>Clear</button>
        </div>
    }
}

export default ChatBox;