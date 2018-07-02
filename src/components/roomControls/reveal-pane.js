import React, { Component } from 'react';
import ViewModel from '../../view-model';
import Constants from '../../constants';
import './reveal-pane.css';
import ClientSocket from '../../client-socket';
import LikeImg from '../../images/like.png';
import LikeActiveImg from '../../images/like_active.png';
import DislikeImg from '../../images/dislike.png';
import DislikeActiveImg from '../../images/dislike_active.png';


class RevealPane extends Component
{
    handleNewRoundClick()
    {
        ViewModel.startRound(ViewModel.gameState.lang);
    }

    handleEndRoundClick()
    {
        ViewModel.gameState.phase = Constants.phases.LOBBY;
        ViewModel.activeView.updateUI();
        if(ViewModel.isHostUser())
            ClientSocket.sendToCurrentRoom(Constants.msg.types.GOTO_LOBBY);
    }

    getSentenceRows()
    {
        const rows = [];
        Object.keys(ViewModel.gameState.players).forEach(userName => 
            {
                const player = ViewModel.gameState.players[userName];
                const texts = [];
                const paper = player.paper;
                if(paper)
                    paper.parts.forEach(part => texts.push(part.text));
                const textsJoined = texts.join(" ");
                const likeBtn = paper.vote > 0 ? 
                    <img className="like-active" src={LikeActiveImg} onClick={() => ViewModel.vote(paper.id, 0)} alt="like active"/> :
                    <img className="like" src={LikeImg} onClick={() => ViewModel.vote(paper.id, 1)} alt="like"/>;
                const dislikeBtn = paper.vote < 0 ? 
                    <img className="dislike-active" src={DislikeActiveImg} onClick={() => ViewModel.vote(paper.id, 0)} alt="dislike active"/> :
                    <img className="dislike" src={DislikeImg} onClick={() => ViewModel.vote(paper.id, -1)} alt="dislike"/>;
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
            const player = ViewModel.gameState.players[userName];
            player.currentScore = 0;
            playerList.push(player);
        });
        Object.keys(ViewModel.gameState.players).forEach(userName =>
        {
            const paper = ViewModel.gameState.players[userName].paper;
            if(!paper)
                return;
            paper.parts.forEach(part =>
            {
                ViewModel.gameState.players[part.authorUserName].currentScore += paper.vote;
            });
        });
        playerList.sort((a,b) => 
        { 
            return (a.previousScore + a.currentScore) < (b.previousScore  + b.currentScore);
        });

        const rows = [];
        playerList.forEach(player =>
        {
            rows.push(
                <div key={player.userName}>
                    <span className="score-user">{player.userName}:</span>
                    <span>{player.previousScore + player.currentScore}</span>
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