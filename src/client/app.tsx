import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import HomeView from "./components/views/home-view";
import JoinView from "./components/views/join-view";
import CreateView from "./components/views/create-view";
import RoomView from "./components/views/room-view";
import HowToView from "./components/views/howto-view";
import ErrorView from "./components/views/error-view";
import registerServiceWorker from "./register-service-worker";
import "./declare.d.ts";
import "./app.css";
import configureStore from "./configure-store";

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className="app">
          <Switch>
            <Route path="/join" component={JoinView} />
            <Route path="/create" component={CreateView} />
            <Route path="/room/:roomCode" component={RoomView} />
            <Route path="/howto" component={HowToView} />
            <Route path="/" render={props => <HomeView {...props} />} />
            <Route path="*" component={ErrorView} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

const store = configureStore();
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
