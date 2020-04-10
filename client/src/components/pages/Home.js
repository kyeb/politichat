import React, { Component } from "react";

import AuthController from "../modules/AuthController";
import RoomList from "../modules/RoomList";
import { Button, Form, Input } from "semantic-ui-react";
import { post } from "../../utilities";
import { navigate } from "@reach/router";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newRoomName: "",
    };
  }

  componentDidMount() {}

  handleNewRoom = () => {
    post("/api/newroom", { roomName: this.state.roomName })
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
          <Input
            className="newroom-name"
            placeholder="Room name"
            onChange={(event) => this.setState({ newRoomName: event.target.value })}
            value={this.state.newRoomName}
          />
          <Button className="newroom-button" onClick={this.handleNewRoom}>
            Create room
          </Button>
        </Form>
      </div>
    );

    // Render the homePage if this.props.user exists (user is logged in),
    //   else render login page
    return <div>{this.props.user ? loggedInLanding : loggedOutLanding}</div>;
  }
}

export default Home;
