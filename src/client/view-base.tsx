import { Component } from 'react';
import ClientHandler from './client-message-handler';

class ViewBase extends Component
{
    constructor(props)
    {
        super(props);
        ClientHandler.activeView = this;
        ClientHandler.initHistory(this.props.history);
    }
}

export default ViewBase;