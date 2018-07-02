import React, { Component } from 'react';
import ViewModel from '../../view-model';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import { ChatMessage } from '../../models';
import './chat-box.css';


class ChatBox extends Component
{
    constructor(props)
    {
        super(props);
        this.inputRef = React.createRef();
        this.scrollViewRef = React.createRef();
        this.state = { messages: [] };
    }

    componentDidUpdate()
    {
        const el = this.scrollViewRef.current;
        el.scrollTo(0, el.scrollHeight);
    }

    pushMessage(chatMsg)
    {
        const cloneMsgs = this.state.messages.slice(0);
        cloneMsgs.push(chatMsg);
        this.setState({ messages: cloneMsgs });
    }

    handleSendClick()
    {
        const text = this.inputRef.current.value;
        if(!text)
            return;
        this.inputRef.current.value = "";
        const chatMsg = new ChatMessage(ViewModel.userName, text);
        ClientSocket.sendToCurrentRoom(Constants.msg.types.CHAT_MESSAGE, chatMsg);
        this.pushMessage(chatMsg);
    }

    handleKeyDown(e)
    {
        if(e.keyCode === 13)
            this.handleSendClick();
    }

    render() 
    {
        let counter = 0;
        const rows = [];
        this.state.messages.forEach(msg => 
            {
                if(msg.authorUserName)
                {
                    rows.push(
                        <div key={counter++}>
                            <span className="chat-author">{msg.authorUserName}</span>
                            <span className="chat-message">{msg.text}</span>
                        </div>
                    );
                }
                else
                {
                    rows.push(
                        <div key={counter++}>
                            <span className="chat-message">{msg.text}</span>
                        </div>
                    );
                }
            });

        return (
            <div className="chat-box">
                <div className="chat-box-chats" ref={this.scrollViewRef}>
                    <div className="chat-box-innerchats">{rows}</div>
                </div>
                <div className="input-row">
                    <input type="text" placeholder="type a message" className="form-control chat-box-input" 
                        onKeyDown={e => this.handleKeyDown(e)} ref={this.inputRef}/>
                </div>
            </div>
        );
    }
}

export default ChatBox;