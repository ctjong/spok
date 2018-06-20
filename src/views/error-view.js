import React from 'react';
import View from '../view-base';
import ViewModel from '../services/view-model';
import './error-view.css';


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
            <div className="view error-view">
                <h1>Something went wrong :)</h1>
                <div>Please try join the room again from the home view</div>
                <button className="btn btn-success home-btn" onClick={e => this.handleHomeClick()}>Back to home view</button>
            </div>
        );
    }
}

export default ErrorView;