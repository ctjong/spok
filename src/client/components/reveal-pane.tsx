import * as React from "react";
import clientHandler from "../services/client-handler";
import Strings from "../strings";
import { ScoreUpdateMessage, Part } from "../../models";
import LikeImg from "../images/like.png";
import LikeActiveImg from "../images/like_active.png";
import DislikeImg from "../images/dislike.png";
import DislikeActiveImg from "../images/dislike_active.png";
import "./reveal-pane.css";
import clientSocket from "../services/client-socket";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { returnType, StoreShape } from "../reducers";
import { setError } from "../actions/error";

const actionCreators = { setError };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room,
    session: state.session
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class RevealPane extends React.Component<DispatchProps & StoreProps, {}> {
  state: { votes: { [key: string]: number } };

  constructor(props: DispatchProps & StoreProps) {
    super(props);
    this.state = { votes: {} };
  }

  handleVoteClick(paperId: string, newVote: number) {
    const cloneVotes = Object.assign({}, this.state.votes);
    cloneVotes[paperId] = cloneVotes[paperId] || 0;
    const oldVote = cloneVotes[paperId];
    cloneVotes[paperId] = newVote;
    const delta = newVote - oldVote;
    clientSocket.send(
      new ScoreUpdateMessage(this.props.session.roomCode, paperId, delta)
    );
    this.setState({ votes: cloneVotes });
  }

  getSentenceRows() {
    const rows: any[] = [];
    Object.keys(this.props.room.papers).forEach(paperId => {
      const paper = this.props.room.papers[paperId];
      const texts: string[] = [];
      paper.parts.forEach((part: Part, index: number) => {
        if (part.text) texts.push(part.text);
        else {
          const randomArr = Strings[this.props.room.lang].randoms[index + 1];
          const randomIdx = Math.floor(
            Math.random() * Math.floor(randomArr.length)
          );
          texts.push(randomArr[randomIdx]);
        }
      });

      const textsJoined = texts.join(" ");
      const vote = this.state.votes[paperId] || 0;
      const likeBtn =
        vote > 0 ? (
          <img
            className="like-active"
            src={LikeActiveImg}
            onClick={() => this.handleVoteClick(paperId, 0)}
            alt="like active"
          />
        ) : (
          <img
            className="like"
            src={LikeImg}
            onClick={() => this.handleVoteClick(paperId, 1)}
            alt="like"
          />
        );
      const dislikeBtn =
        vote < 0 ? (
          <img
            className="dislike-active"
            src={DislikeActiveImg}
            onClick={() => this.handleVoteClick(paperId, 0)}
            alt="dislike active"
          />
        ) : (
          <img
            className="dislike"
            src={DislikeImg}
            onClick={() => this.handleVoteClick(paperId, -1)}
            alt="dislike"
          />
        );
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

  render() {
    const bottomControls = clientHandler.isHostUser() ? null : (
      <div className="reveal-mode-wait-text">
        Waiting for host to take action
      </div>
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

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(RevealPane);
