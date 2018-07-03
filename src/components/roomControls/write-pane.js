import React, { Component } from 'react';
import ViewModel from '../../view-model';
import Strings from '../../strings';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import { Part } from '../../models';
import './write-pane.css';


class WritePane extends Component
{
    constructor(props)
    {
        super(props);
        this.inputRef = React.createRef();
        this.state = { isLoading: false, errorString: null };
    }

    handleSubmitClick()
    {
        if(!this.inputRef.current)
            return;
        const text = this.inputRef.current.value;
        if(!text)
            return;
        this.inputRef.current.value = "";
        const paperId = ViewModel.gameState.players[ViewModel.userName].paperId;
        
        const part = new Part(paperId, text, ViewModel.userName);
        if(!ViewModel.isHostUser())
        {
            ClientSocket.sendToId(Constants.msg.types.SUBMIT_PART, ViewModel.gameState.hostSocketId, part);
            this.setState({ isLoading: true });

            ClientSocket.addOneTimeHandler(Constants.msg.types.STATE_UPDATE,
                () => this.setState({ isLoading: false}),
                () => this.setState({ isLoading: false, errorString: Constants.errorStrings.requestTimedOut }));
        }
        else
        {
            ViewModel.handlePartSubmitted(part);
        }
    }

    render() 
    {
        const label = Strings[ViewModel.gameState.lang][`part${ViewModel.gameState.activePart}label`];
        const placeholder = Strings[ViewModel.gameState.lang][`part${ViewModel.gameState.activePart}placeholder`];

        const body = this.state.isLoading ? (
            <div>Submitting...</div>
        ) : (
            <div>
                <div className="error">{this.state.errorString}</div>
                <div className="control-group">
                    <div>
                        <label>{label}</label>
                    </div>
                    <div>
                        <input type="text" className="input" placeholder={placeholder} ref={this.inputRef}/>
                    </div>
                </div>
                <button className="btn-box submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
            </div>
        );

        return (
            <div className="pane write-pane">
                {body}
            </div>
        );
    }
}

export default WritePane;