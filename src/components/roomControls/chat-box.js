import React, { Component } from 'react';
import './chat-box.css';


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
        return (
            <div className="chat-box">
                <h2>Chat</h2>
                <div className="chat-box-chats"><div className="chat-box-innerchats"></div></div>
                <input type="text" placeholder="type a message" className="form-control chat-box-input" />
                <button className="btn btn-primary chat-send" onClick={e => this.handleSendClick()}>Send</button>
                <button className="btn btn-danger chat-clear" onClick={e => this.handleClearClick()}>Clear</button>
            </div>
        );
    }
}

export default ChatBox;