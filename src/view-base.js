import { Component } from 'react';
import ViewModel from './services/view-model';

class ViewBase extends Component
{
    constructor(props)
    {
        super(props);
        ViewModel.ActiveView = this;
        ViewModel.History = this.props.history;
    }
}

export default ViewBase;