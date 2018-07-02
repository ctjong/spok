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
        if(!text)
            return;
        this.inputRef.current.value = "";
        const part = new Part(text, ViewModel.userName);
        ViewModel.submitPart(part);
    }

    render() 
    {
        const label = Strings[ViewModel.gameState.lang][`part${ViewModel.gameState.activePart}label`];
        const placeholder = Strings[ViewModel.gameState.lang][`part${ViewModel.gameState.activePart}placeholder`];

        return (
            <div className="pane write-pane">
                <div className="control-group">
                    <div>
                        <label>{label}</label>
                    </div>
                    <div>
                        <input type="text" className="input" placeholder={placeholder} ref={this.inputRef}/>
                    </div>
                </div>
                <button className="btn-block btn-box submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
            </div>
        );
    }
}

export default WritePane;