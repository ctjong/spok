import { Component } from 'react';
import ViewModel from './services/view-model';


//-----------------------------
// View
//-----------------------------

class View extends Component
{
    constructor(props)
    {
        super(props);
        ViewModel.ActiveView = this;
        ViewModel.History = this.props.history;
    }
}

export default View;