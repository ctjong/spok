import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomeView from './views/home-view';
import JoinView from './views/join-view';
import CreateView from './views/create-view';
import LobbyView from './views/lobby-view';
import WriteView from './views/write-view';
import SubmittedView from './views/submitted-view';
import RevealView from './views/reveal-view';
import HowToView from './views/howto-view';
import ErrorView from './views/error-view';
import registerServiceWorker from './services/register-service-worker';
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
                        <Route path='/lobby' component={LobbyView} />
                        <Route path='/write' component={WriteView} />
                        <Route path='/submitted' component={SubmittedView} />
                        <Route path='/reveal' component={RevealView} />
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
