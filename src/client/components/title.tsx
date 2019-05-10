import * as React from "react";
import TitleImg from "../images/title.png";
import constants from "../../constants";
import "./title.css";
import navigationService from "../services/navigation-service";

interface TitleProps {
  isLarge: boolean;
}

class Title extends React.Component<TitleProps> {
  handleClick() {
    navigationService.goTo(constants.HOME_PATH);
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
