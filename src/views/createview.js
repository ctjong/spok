import React, { Component } from 'react';
import ViewModel from '../view-model';
import './createview.css';


//-----------------------------
// View
//-----------------------------

class CreateView extends Component
{
    constructor(props)
    {
        super(props);
        this.userNameRef = React.createRef();
    }

    handleSubmitClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    handleBackClick()
    {
        ViewModel.GoTo("/");
    }

    render() 
    {
        return (
            <div class="page createPage">
                <h1>Create room</h1>
                <div class="form-inline">
                    <label>Your user name:</label>
                    <input type="text" class="input form-control" id="createPage_userName" ref={this.userNameRef}/>
                </div>
                <button class="btn btn-success submitBtn" onClick={e => this.handleSubmitClick()}>Submit</button>
                <button class="btn btn-danger backBtn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default CreateView;