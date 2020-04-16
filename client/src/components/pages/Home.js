import React, { Component } from "react";

import AuthController from "../modules/AuthController";
import RoomList from "../modules/RoomList";
import { Button, Form, Input, Message } from "semantic-ui-react";
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
    post("/api/newroom", { roomName: this.state.newRoomName })
      .then((room) => {
        navigate(`/room/${room.id}`);
      })
      .catch((err) => {
        alert(
          "Something went wrong! Try a different name or reloading.\n\nTip: room names cannot contain special characters."
        );
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

    let newRoomForm;
    if (this.props.user && this.props.user.canCreateRooms) {
      newRoomForm = (
        <div className="newroom-container">
          <h2>Create a new room</h2>
          <Form>
            <Input
              className="newroom-name"
              placeholder="Room name"
              onChange={(event) => this.setState({ newRoomName: event.target.value })}
              value={this.state.newRoomName}
            />
            <Button primary className="newroom-button" onClick={this.handleNewRoom}>
              Create room
            </Button>
          </Form>
        </div>
      );
    } else {
      newRoomForm = (
        <Message negative>
          You do not have permissions to create new rooms yet. <br /> Please email us at{" "}
          <a href="mailto:politichat@mit.edu?subject=Politichat Beta access request">
            politichat@mit.edu
          </a>{" "}
          for information on how to gain access to our beta.
        </Message>
      );
    }

    const loggedInLanding = (
      <>
        {newRoomForm}
        <RoomList />
      </>
    );

    // Render the homePage if this.props.user exists (user is logged in),
    //   else render login page
    return <>{this.props.user ? loggedInLanding : loggedOutLanding}</>;
  }
}

export default Home;
