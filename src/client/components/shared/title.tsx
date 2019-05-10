import * as React from "react";
import TitleImg from "../../images/title.png";
import constants from "../../../constants";
import "./title.css";
import util from "../../util";

interface TitleProps {
  isLarge: boolean;
}

class Title extends React.Component<TitleProps> {
  handleClick() {
    util.goTo(constants.HOME_PATH);
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

export default Title;
