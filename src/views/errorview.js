import React from 'react';
import View from '../view';
import ViewModel from '../services/view-model';
import './errorview.css';


//-----------------------------
// View
//-----------------------------

class ErrorView extends View
{
    handleHomeClick()
    {
        ViewModel.GoTo("/");
    }

    render() 
    {
        return (
            <div className="page errorPage">
                <h1>Something went wrong :)</h1>
                <div>Please try join the room again from the home page</div>
                <button className="btn btn-success homeBtn" onClick={e => this.handleHomeClick()}>Back to home page</button>
            </div>
        );
    }
}

export default ErrorView;