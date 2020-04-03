import React, { Component } from "react";

import AuthController from "../modules/AuthController";

class Home extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {};
  }

  componentDidMount() {
    // remember -- api calls go here!
  }

  render() {
    const authController = (
      <AuthController
        logout={this.props.logout}
        loggedIn={this.props.user !== undefined}
        setUser={this.props.setUser}
        providers={["google"]}
      />
    );

    return <div>{this.props.user ? <p>test</p> : authController}</div>;
  }
}

export default Home;
