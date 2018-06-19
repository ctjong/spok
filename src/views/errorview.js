import React, { Component } from 'react';
import ViewModel from '../view-model';
import './errorview.css';


//-----------------------------
// View
//-----------------------------

class ErrorView extends Component
{
    handleHomeClick()
    {
        ViewModel.GoTo("/");
    }

    render() 
    {
        return (
            <div class="page errorPage">
                <h1>Something went wrong :)</h1>
                <div>Please try join the room again from the home page</div>
                <button class="btn btn-success homeBtn" onClick={e => this.handleHomeClick()}>Back to home page</button>
            </div>
        );
    }
}

export default ErrorView;