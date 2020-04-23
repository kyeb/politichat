import React, { Component } from "react";
import AuthController from "../modules/AuthController";
import RoomList from "../modules/RoomList";
import { Form, Message } from "semantic-ui-react";
import { navigate } from "@reach/router";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      joinRoomId: "",
    };
  }

  componentDidMount() {}

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

    navigate(`/room/${roomId}`);
  };

  render() {
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
        <AuthController
          logout={this.props.logout}
          loggedIn={this.props.user !== undefined}
          setUser={this.props.setUser}
          providers={["google"]}
        />
        {joinRoomForm}
        <RoomList />
      </>
    );

    let newRoomForm;
    if (this.props.user && this.props.user.canCreateRooms) {
      newRoomForm = (
        <div className="newroom-container">
          <h2>Create a new room</h2>
          <Form>
            <Form.Button primary className="createroom-button" onClick={this.handleCreateRoom}>
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
