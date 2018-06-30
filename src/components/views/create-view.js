import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import Strings from '../../strings';
import './create-view.css';


class CreateView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.userNameRef = React.createRef();
        this.langSelectRef = React.createRef();
    }

    handleSubmitClick()
    {
        const roomCode = ViewModel.getRandomCode().substring(0, 5);
        const userName = this.userNameRef.current.value;
        if(!userName)
            return;
        let lang = Constants.DEFAULT_LANG;
        if(this.langSelectRef.current)
        {
            const dropdown = this.langSelectRef.current;
            const selectedIndex = dropdown.selectedIndex;
            lang = dropdown.options[selectedIndex].value;
        }
        ClientSocket.sendToServer(Constants.msg.types.CREATE_ROOM, { roomCode, lang }).then(() => 
        {
            ViewModel.initHostUser(roomCode, userName, lang);
            ViewModel.goTo(`/room/${roomCode}`);
        });
    }

    handleBackClick()
    {
        ViewModel.goTo("");
    }

    render() 
    {
        const options = [];
        Object.keys(Strings).forEach(lang => 
            {
                options.push(<option key={lang} value={lang}>{Strings[lang].langName}</option>)
            });

        return (
            <div className="view create-view">
                <h1>Create room</h1>
                <div className="form-inline">
                    <label>Your user name:</label>
                    <input type="text" className="input form-control" id="createPage_userName" ref={this.userNameRef}/>
                    <div>
                        <label>Language: </label>
                        <select className="lang-options" ref={this.langSelectRef}>{options}</select>
                    </div>
                </div>
                <button className="btn btn-success submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
                <button className="btn btn-danger back-btn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default CreateView;