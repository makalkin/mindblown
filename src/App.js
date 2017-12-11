import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Home } from "./containers/Home";
import "semantic-ui-css/semantic.min.css";

class App extends Component {
  render() {
    return (
      <BrowserRouter basename="/mindblown">
        <Switch>
          <Route exact={true} path="/" component={Home} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
