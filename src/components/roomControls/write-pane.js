import React, { Component } from 'react';
import ViewModel from '../../view-model';
import Strings from '../../strings';
import './write-pane.css';


class WritePane extends Component
{
    handleSubmitClick()
    {
        //TODO
        // ViewModel.goTo("/create");
    }

    render() 
    {
        const label = Strings[this.props.lang][`part${this.props.activePart}label`];
        const placeholder = Strings[this.props.lang][`part${this.props.activePart}placeholder`];

        return (
            <div className="pane write-pane">
                <div className="form-inline phrase1">
                    <label>{label}</label>
                    <input type="text" className="input form-control" placeholder={placeholder}/>
                    <button className="btn btn-primary submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
                </div>
            </div>
        );
    }
}

export default WritePane;