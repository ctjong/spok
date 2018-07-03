import { Component } from 'react';
import Game from './game';

class ViewBase extends Component
{
    constructor(props)
    {
        super(props);
        Game.activeView = this;
        Game.initHistory(this.props.history);
    }
}

export default ViewBase;