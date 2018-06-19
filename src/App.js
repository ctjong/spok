import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ViewModel from './view-model';
import HomeView from './views/homeview';
import JoinView from './views/joinview';
import CreateView from './views/createview';
import WriteView from './views/writeview';
import SubmittedView from './views/submittedview';
import RevealView from './views/revealview';
import ErrorView from './views/errorview';
import './app.css';

class App extends Component
{
    constructor(props)
    {
        super(props);
        ViewModel.Initialize();
        this.state = { activePath: window.location.pathname };
    }

    render()
    {
        return (
            <BrowserRouter>
                <div className="app">
                    <Switch>
                        <Route path='/' exact={true} component={HomeView} />
                        <Route path='/join' component={JoinView} />
                        <Route path='/create' component={CreateView} />
                        <Route path='/write' component={WriteView} />
                        <Route path='/submitted' component={SubmittedView} />
                        <Route path='/reveal' component={RevealView} />
                        <Route path='*' component={ErrorView} />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
