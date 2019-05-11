import * as React from "react";
import TitleImg from "../images/title.png";
import "./title.css";
import { goToHome } from "../actions/navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const actionCreators = { goToHome };
type DispatchProps = typeof actionCreators;

interface TitleProps {
  isLarge: boolean;
}

class Title extends React.Component<DispatchProps & TitleProps, {}> {
  handleClick() {
    this.props.goToHome();
  }

  render() {
    return (
      <img
        src={TitleImg}
        alt="SPOK"
        className={
          "title " + (this.props.isLarge ? "title-large" : "title-small")
        }
        onClick={() => this.handleClick()}
      />
    );
  }
}

export default connect(
  null,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Title);
