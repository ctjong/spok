import * as React from "react";
import constants from "spok-shared/constants";
import Strings from "../strings";
import Title from "../components/title";
import "./create-view.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { StoreShape, returnType } from "../reducers";
import { createRoom } from "../actions/room";
import { goToHome, goTo } from "../actions/navigation";

const actionCreators = { createRoom, goToHome, goTo };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    userName: state.room.userName,
    roomCode: state.room.roomCode
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

  componentDidUpdate() {
    if (this.props.roomCode && this.props.room) {
      this.props.goTo(`/room/${this.props.roomCode}`);
    }
  }

  handleSubmitClick() {
    const userName = this.userNameRef.current.value;
    if (!userName) return;

    this.setState({ isLoading: true });
    let lang = constants.DEFAULT_LANG;
    if (this.langSelectRef.current) {
      const dropdown = this.langSelectRef.current;
      const selectedIndex = dropdown.selectedIndex;
      lang = dropdown.options[selectedIndex].value;
    }

    this.props.createRoom(userName, lang);
  }

  handleBackClick() {
    this.props.goToHome();
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
