import React from 'react';
import ViewBase from '../../view-base';
import Game from '../../game';
import ClientSocket from '../../client-socket';
import Constants from '../../constants';
import Strings from '../../strings';
import Title from '../shared/title';
import './create-view.css';


class CreateView extends ViewBase
{
    constructor(props)
    {
        super(props);
        this.userNameRef = React.createRef();
        this.langSelectRef = React.createRef();
        this.state = { isLoading: false };
    }

    handleSubmitClick()
    {
        const roomCode = Game.getRandomCode().substring(0, 5);
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
            Game.initHostUser(roomCode, userName, lang);
            Game.goTo(`/room/${roomCode}`);
        });
        this.setState({ isLoading: true });
    }

    handleBackClick()
    {
        Game.goTo("/");
    }

    render() 
    {
        if(this.state.isLoading)
            return <div>Please wait</div>;

        const options = [];
        Object.keys(Strings).forEach(lang => 
            {
                options.push(<option key={lang} value={lang}>{Strings[lang].langName}</option>)
            });

        return (
            <div className="view create-view">
                <Title isLarge={true} />
                <div>
                    <div className="control-group">
                        <div>
                            <label>Your user name:</label>
                        </div>
                        <div>
                            <input type="text" className="input" id="createPage_userName" ref={this.userNameRef}/>
                        </div>
                    </div>
                    <div className="control-group">
                        <div>
                            <label>Language: </label>
                        </div>
                        <div>
                            <select className="lang-options" ref={this.langSelectRef}>{options}</select>
                        </div>
                    </div>
                </div>
                <button className="btn-box submit-btn" onClick={e => this.handleSubmitClick()}>Submit</button>
                <button className="btn-box btn-danger back-btn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default CreateView;