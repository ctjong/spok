import React, { Component } from 'react';
import ViewModel from '../view-model';
import './writeview.css';


//-----------------------------
// View
//-----------------------------

class WriteView extends Component
{
    handleSubmitClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    render() 
    {
        return (
            <div class="page writePage">
                <h1><span class="userName"></span>@<span class="roomCode"></span></h1>
                <h2 class="sentenceIdHeading">Sentence #<span class="sentenceId"></span></h2>
                <div class="form-inline phrase1">
                    <label></label>
                    <input type="text" class="input form-control"/>
                    <button class="btn btn-primary submitBtn" onClick={e => this.handleSubmitClick()}>Submit</button>
                </div>
            </div>
        );
    }
}

export default WriteView;