import * as React from "react";
import { ViewBase } from "../../view-base";
import constants from "../../../constants";
import clientHandler from "../../client-handler";
import Title from "../shared/title";
import "./home-view.css";
import { Room } from "../../../models";
import { connect } from "react-redux";
import { StoreShape, returnType } from "../../reducers";
import { bindActionCreators } from "redux";
import { setError } from "../../actions/error";
import util from "../../util";
import { hideNotification } from "../../actions/notification";

const actionCreators = { setError, hideNotification };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room,
    activeNotifCode: state.notification.activeCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class HomeView extends ViewBase<StoreProps & DispatchProps, {}> {
  componentWillUnmount() {
    this.props.hideNotification();
  }

  handleCreateClick() {
    util.goTo("/create");
  }

  handleJoinClick() {
    util.goTo("/join");
  }

  handleHowToClick() {
    util.goTo("/howto");
  }

  showNotifUI(notifCode: string) {
    throw new Error("Not implemented");
  }

  hideNotifUI() {
    throw new Error("Not implemented");
  }

  updateRoomState(state: Room) {
    throw new Error("Not implemented");
  }

  disablePrompt() {
    throw new Error("Not implemented");
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
