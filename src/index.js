import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomeView from './views/homeview';
import JoinView from './views/joinview';
import CreateView from './views/createview';
import WriteView from './views/writeview';
import SubmittedView from './views/submittedview';
import RevealView from './views/revealview';
import HowToView from './views/howtoview';
import ErrorView from './views/errorview';
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
