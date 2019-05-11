import * as React from "react";
import RefreshImg from "../images/refresh.png";
import "./refresh-button.css";
import { refreshState } from "../actions/room";
import { StoreShape, returnType } from "../reducers";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const actionCreators = { refreshState };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    userName: state.session.userName,
    roomCode: state.session.roomCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class RefreshButton extends React.Component<DispatchProps & StoreProps, {}> {
  handleRefreshClick() {
    this.props.refreshState(this.props.userName, this.props.roomCode);
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
