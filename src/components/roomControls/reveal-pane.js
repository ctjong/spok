import React, { Component } from 'react';
import ViewModel from '../../view-model';
import Constants from '../../constants';
import Strings from '../../strings';
import ClientSocket from '../../client-socket';
import { ScoreUpdate } from '../../models';
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

    handleNewRoundClick()
    {
        ViewModel.startRound(ViewModel.gameState.lang);
    }

    handleEndRoundClick()
    {
        ViewModel.goToLobby();
    }

    handleVoteClick(paperId, newVote)
    {
        const cloneVotes = Object.assign({}, this.state.votes);
        cloneVotes[paperId] = cloneVotes[paperId] || 0;
        const oldVote = cloneVotes[paperId];
        cloneVotes[paperId] = newVote;
        const delta = newVote - oldVote;
        ClientSocket.sendToId(Constants.msg.types.SCORE_UPDATE, ViewModel.gameState.hostSocketId, 
            new ScoreUpdate(paperId, delta));
        this.setState({ votes: cloneVotes });
    }

    getSentenceRows()
    {
        const rows = [];
        Object.keys(ViewModel.gameState.players).forEach(userName => 
            {
                const player = ViewModel.gameState.players[userName];
                const texts = [];
                if(player.paperId)
                {
                    const paper = ViewModel.gameState.papers[player.paperId];
                    paper.parts.forEach((part, index) => 
                        {
                            if(part.text)
                                texts.push(part.text)
                            else
                            {
                                const randomArr = Strings[ViewModel.gameState.lang][`part${index+1}random`];
                                const randomIdx = Math.floor(Math.random() * Math.floor(randomArr.length));
                                texts.push(randomArr[randomIdx]);
                            }
                        });

                }
                const textsJoined = texts.join(" ");
                const vote = this.state.votes[player.paperId] || 0;
                const likeBtn = vote > 0 ? 
                    <img className="like-active" src={LikeActiveImg} onClick={() => this.handleVoteClick(player.paperId, 0)} alt="like active"/> :
                    <img className="like" src={LikeImg} onClick={() => this.handleVoteClick(player.paperId, 1)} alt="like"/>;
                const dislikeBtn = vote < 0 ? 
                    <img className="dislike-active" src={DislikeActiveImg} onClick={() => this.handleVoteClick(player.paperId, 0)} alt="dislike active"/> :
                    <img className="dislike" src={DislikeImg} onClick={() => this.handleVoteClick(player.paperId, -1)} alt="dislike"/>;
                rows.push(
                    <div className="sentence" key={userName}>
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

    getScoresList()
    {
        const playerList = [];
        Object.keys(ViewModel.gameState.players).forEach(userName => 
        {
            playerList.push(ViewModel.gameState.players[userName]);
        });
        playerList.sort((a,b) => { return a.score < b.score; });

        const rows = [];
        playerList.forEach(player =>
        {
            rows.push(
                <div key={player.userName}>
                    <span className="score-user">{player.userName}:</span>
                    <span>{player.score}</span>
                </div>
            );
        });
        return rows;
    }

    render() 
    {
        const bottomControls = ViewModel.isHostUser() ? (
                <div>
                    <button className="btn-box new-round-btn" onClick={e => this.handleNewRoundClick(e)}>
                        New round
                    </button>
                    <button className="btn-box end-round-btn" onClick={e => this.handleEndRoundClick(e)}>
                        Back to lobby
                    </button>
                </div>
            ) : (
                <div className="reveal-mode-wait-text">Waiting for host to take action</div>
            );

        return (
            <div className="pane reveal-pane">
                <div className="reveal-section">
                    <h2>Results</h2>
                    <div className="results">{this.getSentenceRows()}</div>
                </div>
                <div className="reveal-section">
                    <h2>Scores</h2>
                    <div className="scores">{this.getScoresList()}</div>
                </div>
                {bottomControls}
            </div>
        );
    }
}

export default RevealPane;