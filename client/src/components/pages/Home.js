import React, { Component } from "react";

import AuthController from "../modules/AuthController";
import VideoChat from "../modules/VideoChat";
import RoomList from "../modules/RoomList";

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
    const loggedOutLanding = (
      <>
        <AuthController
          logout={this.props.logout}
          loggedIn={this.props.user !== undefined}
          setUser={this.props.setUser}
          providers={["google"]}
        />
        <RoomList />
      </>
    );

    const loggedInLanding = <VideoChat user={this.props.user} />;

    // Render the homePage if this.props.user exists (user is logged in),
    //   else render login page
    return <div>{this.props.user ? loggedInLanding : loggedOutLanding}</div>;
  }
}

export default Home;
