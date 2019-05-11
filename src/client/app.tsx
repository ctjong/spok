import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import HomeView from "./views/home-view";
import JoinView from "./views/join-view";
import CreateView from "./views/create-view";
import RoomView from "./views/room-view";
import HowToView from "./views/howto-view";
import ErrorView from "./views/error-view";
import registerServiceWorker from "./register-service-worker";
import "./declare.d.ts";
import "./app.css";
import configureStore from "./configure-store";
import ClientHandler from "./services/client-handler";

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className="app">
          <ClientHandler />
          <Switch>
            <Route path="/join" render={props => <JoinView {...props} />} />
            <Route path="/create" render={props => <CreateView {...props} />} />
            <Route
              path="/room/:roomCode"
              render={props => <RoomView {...props} />}
            />
            <Route path="/howto" render={props => <HowToView {...props} />} />
            <Route path="/" render={props => <HomeView {...props} />} />
            <Route path="*" render={props => <ErrorView {...props} />} />
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
