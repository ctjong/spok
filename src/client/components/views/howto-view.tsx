import React from 'react';
import ViewBase from '../../view-base';
import Constants from '../../../constants';
import ClientHandler from '../../client-message-handler';
import Title from '../shared/title';
import './howto-view.css';


class HowToView extends ViewBase
{
    handleBackClick()
    {
        ClientHandler.goTo(Constants.HOME_PATH);
    }

    render() 
    {
        return (
            <div className="view howto-view">
                <Title isLarge={false} />
                <h1>How to play</h1>
                <div>
                    <p>This game of wordplay involves at least 2 players. The aim of the game is to create complete sentences by writing one part of that sentence during your turn. There are typically 4 parts of a sentence:</p>
                    <p className="no-margin">1. SUBJECT</p>
                    <p className="no-margin">2. VERB</p>
                    <p className="no-margin">3. OBJECT</p>
                    <p className="no-margin">4. ADJECTIVE or ADVERB</p>

                    <p>At the end of each round, the new sentences made up of the entered words are generated. At this point, you should understand why this game can be hillarious.</p>

                    <p>Here are two tips that we think can be really beneficial for you:</p>
                    <p className="no-margin">1. Allow your creative energy to flow</p>
                    <p className="no-margin">2. JUST GO CRAZY AND HAVE FUN!</p>
                </div>
                <button className="btn-box back-btn" onClick={e => this.handleBackClick()}>Back</button>
            </div>
        );
    }
}

export default HowToView;