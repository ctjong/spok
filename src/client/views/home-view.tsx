import * as React from "react";
import constants from "../../constants";
import Title from "../components/title";
import "./home-view.css";
import { connect } from "react-redux";
import { StoreShape, returnType } from "../reducers";
import { bindActionCreators } from "redux";
import { setError } from "../actions/error";
import { hideNotification } from "../actions/notification";
import navigationService from "../services/navigation-service";
import { exitRoom } from "../actions/room";

const actionCreators = { setError, hideNotification, exitRoom };
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
  componentDidMount() {
    if (this.props.room) {
      this.props.exitRoom(constants.notifCodes.UNKNOWN_ERROR);
    }
  }

  componentWillUnmount() {
    this.props.hideNotification();
  }

  handleCreateClick() {
    navigationService.goTo("/create");
  }

  handleJoinClick() {
    navigationService.goTo("/join");
  }

  handleHowToClick() {
    navigationService.goTo("/howto");
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
