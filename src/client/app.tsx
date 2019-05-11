import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import HomeView from "./views/home-view";
import JoinView from "./views/join-view";
import CreateView from "./views/create-view";
import RoomView from "./views/room-view";
import HowToView from "./views/howto-view";
import NotFoundView from "./views/notfound-view";
import registerServiceWorker from "./register-service-worker";
import "./declare.d.ts";
import "./app.css";
import configureStore from "./configure-store";
import ClientHandler from "./services/client-handler";
import NavigationHandler from "./services/navigation-handler";

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Route
          path="*"
          render={props => {
            return (
              <div className="app">
                <NavigationHandler history={props.history} />
                <ClientHandler />

                <Switch>
                  <Route
                    path="/join"
                    render={props => <JoinView {...props} />}
                  />
                  <Route
                    path="/create"
                    render={props => <CreateView {...props} />}
                  />
                  <Route
                    path="/room/:roomCode"
                    render={props => <RoomView {...props} />}
                  />
                  <Route
                    path="/howto"
                    render={props => <HowToView {...props} />}
                  />
                  <Route path="/" render={props => <HomeView {...props} />} />
                  <Route
                    path="*"
                    render={props => <NotFoundView {...props} />}
                  />
                </Switch>
              </div>
            );
          }}
        />
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
