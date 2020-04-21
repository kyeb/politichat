import React, { Component } from "react";

import AuthController from "../modules/AuthController";
import RoomList from "../modules/RoomList";
import { Form, Message } from "semantic-ui-react";
import { post } from "../../utilities";
import { navigate } from "@reach/router";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      joinRoomId: "",
      newRoomName: "",
      newRoomLink: "",
      newRoomPrivate: true
    };
  }

  componentDidMount() {}

  handleNewRoom = () => {
    post("/api/newroom", { roomName: this.state.newRoomName, roomLink: this.state.newRoomLink, isPrivate: this.state.newRoomPrivate })
      .then((room) => {
        navigate(`/room/${room.id}`);
      })
      .catch((err) => {
        alert(
          "Something went wrong! Try a different name or reloading.\n\nTip: room names cannot contain special characters."
        );
      });
  };

  handleJoinRoom = () => {
    navigate(`/room/${this.state.joinRoomId}`);
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
            <Form.Input
              className="newroom-name"
              placeholder="Room name"
              onChange={(event) => this.setState({ newRoomName: event.target.value })}
              value={this.state.newRoomName}
              width={5}
            />
             <Form.Input
              className="newroom-link"
              placeholder="Room link"
              onChange={(event) => this.setState({ newRoomLink: event.target.value })}
              value={this.state.newRoomLink}
              width={5}
            />
            <Form.Checkbox
              checked={this.state.newRoomPrivate}
              label={<label>Private</label>}
              onChange={(event) => this.setState((prevState) => ({ newRoomPrivate: !prevState.newRoomPrivate }))}
            />
            <Form.Button primary className="newroom-button" onClick={this.handleNewRoom}>
              Create room
            </Form.Button>
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

    let joinRoomForm = (
      <div className="joinroom-container">
        <h2>Join a room by ID</h2>
        <Form>
          <Form.Input
            className="joinroom-id"
            placeholder="Room ID"
            onChange={(event) => this.setState({ joinRoomId: event.target.value })}
            value={this.state.joinRoomId}
            width={5}
          />
          <Form.Button primary className="joinroom-button" onClick={this.handleJoinRoom}>
            Join room
          </Form.Button>
        </Form>
      </div>
    );

    const loggedInLanding = (
      <>
        {newRoomForm}
        {joinRoomForm}
        <RoomList />
      </>
    );

    // Render the homePage if this.props.user exists (user is logged in),
    //   else render login page
    return <>{this.props.user ? loggedInLanding : loggedOutLanding}</>;
  }
}

export default Home;
