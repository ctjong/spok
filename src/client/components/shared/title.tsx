import * as React from "react";
import TitleImg from "../../images/title.png";
import Constants from "../../../constants";
import ClientHandler from "../../client-message-handler";
import "./title.css";

interface TitleProps {
  isLarge: boolean;
}

class Title extends React.Component<TitleProps> {
  handleClick() {
    ClientHandler.goTo(Constants.HOME_PATH);
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
