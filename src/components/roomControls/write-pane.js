import React, { Component } from 'react';
import ViewModel from '../../view-model';
import './write-pane.css';


class WriteView extends Component
{
    handleSubmitClick()
    {
        //TODO
        // ViewModel.goTo("/create");
    }

    render() 
    {
        return (
            <div className="pane write-pane">
                <div className="form-inline phrase1">
                    <label></label>
                    <input type="text" className="input form-control"/>
                    <button className="btn btn-primary submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
                </div>
            </div>
        );
    }
}

export default WriteView;