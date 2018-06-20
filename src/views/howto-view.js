import React from 'react';
import ViewBase from '../view-base';
import ViewModel from '../services/view-model';
import './howto-view.css';


//-----------------------------
// View
//-----------------------------

class HowToView extends ViewBase
{
    handleBackClick()
    {
        ViewModel.GoTo("/");
    }

    render() 
    {
        return (
            <div className="view howto-view">
                <h1>How to play</h1>
                <p>
                    This is an online version of the classic party/gathering game from Indonesia, SPOK. This usually involves 2 or more people.
                    In the classic version, each participant is given a pencil and a small piece of paper, which they use for writing a part of a sentence in each turn.
                    There are typically 4 turns in each round of the game, the first turn is for writing the subject of a sentence, the second is for the verb, third is object,
                    fourth is adjective/adverb. At the end of each turn, each player folds the paper to cover the words they just wrote and hands over the paper to the person 
                    next to them, so that in the end, the final sentence on that paper is a combination of phrases written by different people. At the end of the round, each 
                    player unfolds the paper they get and read out loud the sentence on it (which is often times pretty hilarious). After that the players can continue to 
                    have as many rounds as they want until they get tired of laughing. 
                </p>
                <p>
                    To start, a person needs to be the host and create a room. After a room is created, a 5-character room code is generated,
                    which other players can use to join. After all expected players have joined, the host can start a round. There is an option for the host to change the 
                    language of the round, default is Indonesian. At the end of the round, the host can either start a new round or go back to the lobby to allow more people to join.
                </p>
                <button className="btn btn-primary back-btn" onClick={e => this.handleBackClick()}>Back to home</button>
            </div>
        );
    }
}

export default HowToView;