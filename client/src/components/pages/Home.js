import React, { Component } from "react";

import AuthController from "../modules/AuthController";
import VideoChat from "../modules/VideoChat";

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

    const homePage = <VideoChat user={this.props.user} />;

    // Render the homePage if this.props.user exists (user is logged in),
    //   else render login page
    return <div>{this.props.user ? homePage : authController}</div>;
  }
}

export default Home;
