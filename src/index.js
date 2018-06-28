import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomeView from './components/views/home-view';
import JoinView from './components/views/join-view';
import CreateView from './components/views/create-view';
import RoomView from './components/views/room-view';
import HowToView from './components/views/howto-view';
import ErrorView from './components/views/error-view';
import registerServiceWorker from './register-service-worker';
import './libs/bootstrap.min.css';
import './index.css';

class App extends Component
{
    render()
    {
        return (
            <BrowserRouter>
                <div className="app">
                    <Switch>
                        <Route path='/join' component={JoinView} />
                        <Route path='/create' component={CreateView} />
                        <Route path='/room/:roomCode' component={RoomView} />
                        <Route path='/howto' component={HowToView} />
                        <Route path='/' component={HomeView} />
                        <Route path='*' component={ErrorView} />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
