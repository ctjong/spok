import React from 'react';
import View from '../view';
import ViewModel from '../services/view-model';
import './writeview.css';


//-----------------------------
// View
//-----------------------------

class WriteView extends View
{
    handleSubmitClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    render() 
    {
        return (
            <div className="page writePage">
                <h1><span className="userName"></span>@<span className="roomCode"></span></h1>
                <h2 className="sentenceIdHeading">Sentence #<span className="sentenceId"></span></h2>
                <div className="form-inline phrase1">
                    <label></label>
                    <input type="text" className="input form-control"/>
                    <button className="btn btn-primary submitBtn" onClick={e => this.handleSubmitClick()}>Submit</button>
                </div>
            </div>
        );
    }
}

export default WriteView;