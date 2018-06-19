import React from 'react';
import View from '../view';
import ViewModel from '../services/view-model';
import './createview.css';


//-----------------------------
// View
//-----------------------------

class CreateView extends View
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
        ViewModel.GoTo("");
    }

    render() 
    {
        return (
            <div className="page createPage">
                <h1>Create room</h1>
                <div className="form-inline">
                    <label>Your user name:</label>
                    <input type="text" className="input form-control" id="createPage_userName" ref={this.userNameRef}/>
                </div>
                <button className="btn btn-success submitBtn" onClick={e => this.handleSubmitClick()}>Submit</button>
                <button className="btn btn-danger backBtn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default CreateView;