import React from "react";
import {
  Switch,
  Route,
  BrowserRouter as Router,
  browserHistory
} from "react-router-dom";
import { withRouter } from "react-router-dom";
import HomeComponent from "./Home/Components/HomeComponent";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <Router history={browserHistory}>
          <Route exact path="/" component={HomeComponent} />
        </Router>
      </React.Fragment>
    );
  }
}
export default withRouter(App);
