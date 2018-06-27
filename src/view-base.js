import { Component } from 'react';
import ViewModel from './view-model';

class ViewBase extends Component
{
    constructor(props)
    {
        super(props);
        ViewModel.activeView = this;
        ViewModel.history = this.props.history;
    }
}

export default ViewBase;