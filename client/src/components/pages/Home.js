import React, { Component } from "react";

import AuthController from "../modules/AuthController";
import RoomList from "../modules/RoomList";
import { Button, Form } from "semantic-ui-react";
import { post } from "../../utilities";
import { navigate } from "@reach/router";

class Home extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {};
  }

  componentDidMount() {
    // remember -- api calls go here!
  }

  handleNewRoom = () => {
    post("/api/newroom", {})
      .then((room) => {
        navigate(`/room/${room.id}`);
      })
      .catch((err) => {
        navigate("/room/error");
      });
  };

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

    const loggedInLanding = (
      <div className="newroom-container">
        <Form>
          <Button onClick={this.handleNewRoom}>Create room</Button>
        </Form>
      </div>
    );

    // Render the homePage if this.props.user exists (user is logged in),
    //   else render login page
    return <div>{this.props.user ? loggedInLanding : loggedOutLanding}</div>;
  }
}

export default Home;
