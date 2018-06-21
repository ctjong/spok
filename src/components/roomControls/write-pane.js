import React from 'react';
import ViewModel from '../../view-model';
import './write-pane.css';


class WriteView
{
    handleSubmitClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    render() 
    {
        return (
            <div className="pane write-pane">
                <h1><span className="user-name"></span>@<span className="room-code"></span></h1>
                <h2 className="paper-id-heading">Paper #<span className="paper-id"></span></h2>
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