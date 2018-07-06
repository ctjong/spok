import React, { Component } from 'react';
import Game from '../../game';
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
        const paperId = Game.state.players[Game.userName].paperId;
        
        const part = new Part(paperId, text, Game.userName);
        if(!Game.isHostUser())
        {
            ClientSocket.sendToId(Constants.msg.types.SUBMIT_PART, Game.state.hostSocketId, part);
            this.setState({ isLoading: true });

            ClientSocket.addOneTimeHandler(
                Constants.msg.types.STATE_UPDATE,
                () => this.setState({ isLoading: false}),
                Constants.STATE_REFRESH_TIMEOUT,
                () => this.setState({ isLoading: false, errorString: Constants.errorStrings.REQUEST_TIMED_OUT })
            );
        }
        else
        {
            Game.handlePartSubmitted(part);
        }
    }

    render() 
    {
        if(this.state.isLoading)
            return <div>Please wait</div>;

        const label = Strings[Game.state.lang][`part${Game.state.activePart}label`];
        const placeholder = Strings[Game.state.lang][`part${Game.state.activePart}placeholder`];

        return (
            <div className="pane write-pane">
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
            </div>
        );
    }
}

export default WritePane;