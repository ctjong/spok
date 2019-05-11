import { History } from "history";
import * as React from "react";
import { goTo } from "../actions/navigation";
import { StoreShape, returnType } from "../reducers";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const actionCreators = { goTo };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return { path: state.navigation.path };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

interface NavigationHandlerProps {
  history: History;
}

class NavigationHandler extends React.Component<
  DispatchProps & StoreProps & NavigationHandlerProps,
  {}
> {
  componentDidUpdate() {
    if (window.location.pathname !== this.props.path) {
      this.props.history.push(this.props.path);
    }
  }

  render(): any {
    return null;
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(NavigationHandler);
