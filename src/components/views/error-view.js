import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import './error-view.css';


class ErrorView extends ViewBase
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