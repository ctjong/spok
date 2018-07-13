import React, { Component } from 'react';
import ClientHandler from '../../client-message-handler';
import Strings from '../../strings';
import ClientSocket from '../../client-socket';
import { ScoreUpdateMessage } from '../../models';
import LikeImg from '../../images/like.png';
import LikeActiveImg from '../../images/like_active.png';
import DislikeImg from '../../images/dislike.png';
import DislikeActiveImg from '../../images/dislike_active.png';
import './reveal-pane.css';


class RevealPane extends Component
{
    constructor(props)
    {
        super(props);
        this.state = { votes: {} };
    }

    handleVoteClick(paperId, newVote)
    {
        const cloneVotes = Object.assign({}, this.state.votes);
        cloneVotes[paperId] = cloneVotes[paperId] || 0;
        const oldVote = cloneVotes[paperId];
        cloneVotes[paperId] = newVote;
        const delta = newVote - oldVote;
        ClientSocket.send(new ScoreUpdateMessage(ClientHandler.roomCode, paperId, delta));
        this.setState({ votes: cloneVotes });
    }

    getSentenceRows()
    {
        const rows = [];
        Object.keys(ClientHandler.getRoomState().papers).forEach(paperId => 
            {
                const paper = ClientHandler.getRoomState().papers[paperId];
                const texts = [];
                paper.parts.forEach((part, index) => 
                    {
                        if(part.text)
                            texts.push(part.text)
                        else
                        {
                            const randomArr = Strings[ClientHandler.getRoomState().lang][`part${index+1}random`];
                            const randomIdx = Math.floor(Math.random() * Math.floor(randomArr.length));
                            texts.push(randomArr[randomIdx]);
                        }
                    });

                const textsJoined = texts.join(" ");
                const vote = this.state.votes[paperId] || 0;
                const likeBtn = vote > 0 ? 
                    <img className="like-active" src={LikeActiveImg} onClick={() => this.handleVoteClick(paperId, 0)} alt="like active"/> :
                    <img className="like" src={LikeImg} onClick={() => this.handleVoteClick(paperId, 1)} alt="like"/>;
                const dislikeBtn = vote < 0 ? 
                    <img className="dislike-active" src={DislikeActiveImg} onClick={() => this.handleVoteClick(paperId, 0)} alt="dislike active"/> :
                    <img className="dislike" src={DislikeImg} onClick={() => this.handleVoteClick(paperId, -1)} alt="dislike"/>;
                rows.push(
                    <div className="sentence" key={paperId}>
                        <div>{textsJoined}</div>
                        <div className="vote-buttons">
                            {likeBtn}
                            {dislikeBtn}
                        </div>
                    </div>
                );
            });
        return rows;
    }

    render() 
    {
        const bottomControls = ClientHandler.isHostUser() ? null : (
            <div className="reveal-mode-wait-text">Waiting for host to take action</div>
        );

        return (
            <div className="pane reveal-pane">
                <h2>Results</h2>
                <div className="results">{this.getSentenceRows()}</div>
                {bottomControls}
            </div>
        );
    }
}

export default RevealPane;