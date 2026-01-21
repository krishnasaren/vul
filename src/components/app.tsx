import React from 'react';
import { Route, Redirect, Switch } from 'wouter';
import InstallRoute from './routes/install';
import LoginRoute from './routes/login';
import SetupRoute from './routes/setup';
import StatusRoute from './routes/status';

const App = () => (
  <div className="h-full">
    <Switch>
      <Route path="/app/login">
        <LoginRoute />
      </Route>
      <Route path="/app/install">
        <InstallRoute />
      </Route>
      <Route path="/app/setup">
        <SetupRoute />
      </Route>
      <Route path="/app/status">
        <StatusRoute />
      </Route>

      <Route>
        <Redirect to="/app/login" />
      </Route>
    </Switch>
  </div>
);

export default App;
