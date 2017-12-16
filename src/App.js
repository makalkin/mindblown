import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Home } from "./containers/Home";
import { NotFound } from "./containers/NotFound";

import "semantic-ui-css/semantic.min.css";

class App extends Component {
  render() {
    return (
      <BrowserRouter
        basename={process.env.NODE_ENV === "production" ? "/mindblown" : "/"}
      >
        <Switch>
          <Route exact={true} path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
