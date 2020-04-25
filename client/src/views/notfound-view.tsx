import * as React from "react";
import "./notfound-view.css";
import { goToHome } from "../actions/navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const actionCreators = { goToHome };
type DispatchProps = typeof actionCreators;

class NotFoundView extends React.Component<DispatchProps, {}> {
  handleHomeClick() {
    this.props.goToHome();
  }

  render() {
    return (
      <div className="view notfound-view">
        <h1>URL not found</h1>
        <div>Please try join the room again from the home view</div>
        <button
          className="btn btn-success home-btn"
          onClick={e => this.handleHomeClick()}
        >
          Back to home view
        </button>
      </div>
    );
  }
}

export default connect(
  null,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(NotFoundView);
