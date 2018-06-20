import React from 'react';
import ViewBase from '../view-base';
import ViewModel from '../services/view-model';
import './write-view.css';


//-----------------------------
// View
//-----------------------------

class WriteView extends ViewBase
{
    handleSubmitClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    render() 
    {
        return (
            <div className="view write-view">
                <h1><span className="user-name"></span>@<span className="room-code"></span></h1>
                <h2 className="sentence-id-heading">Sentence #<span className="sentence-id"></span></h2>
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