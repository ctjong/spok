import React, { Component, RefObject } from 'react';
import ClientHandler from '../../client-message-handler';
import ClientSocket from '../../client-socket';
import { ChatMessage } from '../../../models';
import './chat-box.css';

interface ChatBoxState {
    messages:ChatMessage[]
}

class ChatBox extends Component
{
    inputRef:RefObject<any>
    scrollViewRef:RefObject<any>
    state:ChatBoxState

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
        const newMessages = [];
        this.state.messages.forEach(msg => newMessages.push(msg));
        newMessages.push(chatMsg);
        this.setState({ messages: newMessages });
    }

    handleSendClick()
    {
        const text = this.inputRef.current.value;
        if(!text)
            return;
        this.inputRef.current.value = "";
        ClientSocket.send(new ChatMessage(ClientHandler.roomCode, ClientHandler.userName, text));
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