import * as React from "react";
import constants from "spok-shared/constants";
import Title from "../components/title";
import "./home-view.css";
import { connect } from "react-redux";
import { StoreShape, returnType } from "../reducers";
import { bindActionCreators } from "redux";
import { hideNotification } from "../actions/notification";
import { goTo } from "../actions/navigation";

const actionCreators = { hideNotification, goTo };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    activeNotifCode: state.notification.activeCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class HomeView extends React.Component<StoreProps & DispatchProps, {}> {
  componentWillUnmount() {
    if (this.props.activeNotifCode) this.props.hideNotification();
  }

  handleCreateClick() {
    this.props.goTo("/create");
  }

  handleJoinClick() {
    this.props.goTo("/join");
  }

  handleHowToClick() {
    this.props.goTo("/howto");
  }

  render() {
    const errorBanner = !this.props.activeNotifCode ? null : (
      <div className="error">
        {constants.notifStrings[this.props.activeNotifCode]}
      </div>
    );
    return (
      <div className="view home-view">
        <Title isLarge={true} />
        {errorBanner}
        <button
          className="btn-box create-btn"
          onClick={e => this.handleCreateClick()}
        >
          Create room
        </button>
        <button
          className="btn-box join-btn"
          onClick={e => this.handleJoinClick()}
        >
          Join room
        </button>
        <button
          className="btn-box howto-btn"
          onClick={e => this.handleHowToClick()}
        >
          How to play
        </button>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(HomeView);
