import React, { Component } from 'react';
import ViewModel from '../../view-model';
import Strings from '../../strings';
import './write-pane.css';
import { Part } from '../../models';


class WritePane extends Component
{
    constructor(props)
    {
        super(props);
        this.inputRef = React.createRef();
    }

    handleSubmitClick()
    {
        if(!this.inputRef.current)
            return;
        const text = this.inputRef.current.value;
        const userName = ViewModel.getUserName();
        this.inputRef.current.value = "";
        const part = new Part(text, userName);
        ViewModel.submitPart(part);
    }

    render() 
    {
        const label = Strings[ViewModel.gameState.lang][`part${ViewModel.gameState.activePart}label`];
        const placeholder = Strings[ViewModel.gameState.lang][`part${ViewModel.gameState.activePart}placeholder`];

        return (
            <div className="pane write-pane">
                <div className="form-inline phrase1">
                    <label>{label}</label>
                    <input type="text" className="input form-control" placeholder={placeholder} ref={this.inputRef}/>
                    <button className="btn btn-primary submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
                </div>
            </div>
        );
    }
}

export default WritePane;