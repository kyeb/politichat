import React, { Component } from "react";
import AuthController from "../modules/AuthController";
import RoomList from "../modules/RoomList";
import LoggedInHome from "./LoggedInHome";
import { Form, Input, Label, Loader } from "semantic-ui-react";
import { navigate } from "@reach/router";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleCreateRoom = () => {
    navigate(`/create`);
  };

  handleJoinRoom = () => {
    let stripId = (roomId) => {
      // allow pasting link; strip after last '/'
      let split = roomId.split("/");
      return split[split.length - 1];
    };

    let roomId = stripId(this.state.joinRoomId);

    if (this.state.roomIds !== -1 && !this.state.roomIds.includes(roomId)) {
      this.setState({ joinRoomError: "No room found with given ID" });
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  render() {
    if (!this.props.socketConnected) {
      return <Loader active />;
    }

    let joinRoomErrorLabel = <div />;
    if (this.state.joinRoomError) {
      joinRoomErrorLabel = (
        <Label pointing prompt>
          {this.state.joinRoomError}
        </Label>
      );
    }

    let joinRoomForm = (
      <div className="joinroom-container">
        <h2>Join a room by ID</h2>
        <Form>
          <Form.Field className="joinroom-id">
            <Input
              placeholder="Room ID"
              onChange={(event) => this.setState({ joinRoomId: event.target.value })}
              value={this.state.joinRoomId}
            />
            {joinRoomErrorLabel}
          </Form.Field>
          <Form.Button
            primary
            className="joinroom-button"
            onClick={this.handleJoinRoom}
            disabled={this.state.joinRoomId === ""}
          >
            Join room
          </Form.Button>
        </Form>
      </div>
    );

    const loggedOutLanding = (
      <>
        <div className="twocolumn">
          {joinRoomForm}
          <AuthController
            logout={this.props.logout}
            loggedIn={this.props.user !== undefined}
            setUser={this.props.setUser}
            providers={["google"]}
          />
        </div>
        <RoomList />
      </>
    );

    const loggedInLanding = <LoggedInHome user={this.props.user} />;

    // Render the homePage if this.props.user exists (user is logged in),
    //   else render login page
    return <>{this.props.user ? loggedInLanding : loggedOutLanding}</>;
  }
}

export default Home;
