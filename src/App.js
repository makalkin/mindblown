import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import "semantic-ui-css/semantic.min.css";
import { Home } from "./containers/Home";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact={true} path="/" component={Home} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
