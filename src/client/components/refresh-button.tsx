import * as React from "react";
import RefreshImg from "../images/refresh.png";
import "./refresh-button.css";
import { syncRoom } from "../actions/room";
import { StoreShape, returnType } from "../reducers";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const actionCreators = { syncRoom };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    userName: state.room.userName,
    roomCode: state.room.roomCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class RefreshButton extends React.Component<DispatchProps & StoreProps, {}> {
  handleRefreshClick() {
    this.props.syncRoom(this.props.userName, this.props.roomCode);
  }

  render() {
    return (
      <div className="refresh-btn" onClick={() => this.handleRefreshClick()}>
        <img src={RefreshImg} alt="refresh" />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(RefreshButton);
