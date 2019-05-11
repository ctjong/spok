import * as React from "react";
import constants from "../../constants";
import Strings from "../strings";
import Title from "../components/title";
import { CreateRoomMessage, Room } from "../../models";
import "./create-view.css";
import util from "../../util";
import clientSocket from "../services/client-socket";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setError } from "../actions/error";
import { StoreShape, returnType } from "../reducers";
import { setSessionUserName } from "../actions/session";
import navigationService from "../services/navigation-service";
import { exitRoom } from "../actions/room";

const actionCreators = { setError, setSessionUserName, exitRoom };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    userName: state.session.userName,
    roomCode: state.session.roomCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

interface CreateViewState {
  isLoading: boolean;
}

class CreateView extends React.Component<
  DispatchProps & StoreProps,
  CreateViewState
> {
  userNameRef: React.RefObject<any>;
  langSelectRef: React.RefObject<any>;

  constructor(props: DispatchProps & StoreProps) {
    super(props);
    this.userNameRef = React.createRef();
    this.langSelectRef = React.createRef();
    this.state = { isLoading: false };
  }

  componentDidMount() {
    if (this.props.room) {
      this.props.exitRoom(constants.notifCodes.UNKNOWN_ERROR);
    }
  }

  handleSubmitClick() {
    const roomCode = util.getRandomCode().substring(0, 5);
    const userName = this.userNameRef.current.value;
    if (!userName) return;

    this.setState({ isLoading: true });
    this.props.setSessionUserName(userName);
    let lang = constants.DEFAULT_LANG;
    if (this.langSelectRef.current) {
      const dropdown = this.langSelectRef.current;
      const selectedIndex = dropdown.selectedIndex;
      lang = dropdown.options[selectedIndex].value;
    }
    clientSocket
      .send(new CreateRoomMessage(roomCode, userName, lang))
      .then(() => {
        navigationService.goTo(`/room/${roomCode}`);
      });
  }

  handleBackClick() {
    navigationService.goTo(constants.HOME_PATH);
  }

  render() {
    if (this.state.isLoading) return <div>Please wait</div>;

    const optionDoms: any[] = [];
    Object.keys(Strings).forEach(lang => {
      optionDoms.push(
        <option key={lang} value={lang}>
          {Strings[lang].langName}
        </option>
      );
    });

    return (
      <div className="view create-view">
        <Title isLarge={true} />
        <div>
          <div className="control-group">
            <div>
              <label>Your user name:</label>
            </div>
            <div>
              <input
                type="text"
                className="input"
                id="createPage_userName"
                ref={this.userNameRef}
              />
            </div>
          </div>
          <div className="control-group">
            <div>
              <label>Language: </label>
            </div>
            <div>
              <select className="lang-options" ref={this.langSelectRef}>
                {optionDoms}
              </select>
            </div>
          </div>
        </div>
        <button
          className="btn-box submit-btn"
          onClick={e => this.handleSubmitClick()}
        >
          Submit
        </button>
        <button
          className="btn-box btn-danger back-btn"
          onClick={e => this.handleBackClick()}
        >
          Back
        </button>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(CreateView);
