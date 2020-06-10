import React, { Component } from "react";
import AuthController from "../modules/AuthController";
import RoomList from "../modules/RoomList";
import { Form, Input, Label, Message, Divider, Loader } from "semantic-ui-react";
import { get, post } from "../../utilities";
import { navigate } from "@reach/router";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      joinRoomError: "",
      joinRoomId: "",
      newDisplayName: "",
      roomIds: -1, // placeholder indicating hasn't loaded
    };
  }

  componentDidMount() {
    get("/api/room/list").then((rooms) => {
      let ids = rooms.map((room) => room.id);
      this.setState({ roomIds: ids });
    });
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

  handleUpdateDisplayName = () => {
    post("/api/user/displayname", { displayName: this.state.newDisplayName })
      .then((res) => {
        if (res.success) {
          this.props.user.displayName = this.state.newDisplayName;
          this.setState({ newDisplayName: "" });
        }
      })
      .catch((err) => {
        alert("Error when updating display name. See console for more details.");
      });
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
        <div>
          <h2>Create a new room</h2>
          <Message negative>
            You do not have permissions to create new rooms yet. <br /> Please email us at{" "}
            <a href="mailto:politichat@mit.edu?subject=Politichat Beta access request">
              politichat@mit.edu
            </a>{" "}
            for information on how to gain access to our beta.
          </Message>
        </div>
      );
    }

    const updateDisplayName = (
      <Form>
        <h3>Update your display name</h3>
        <p>This is the name users will see when joining your rooms.</p>
        <Input
          placeholder={this.props.user?.displayName}
          action={{ content: "Update", onClick: this.handleUpdateDisplayName, primary: true }}
          onChange={(event) => this.setState({ newDisplayName: event.target.value })}
          value={this.state.newDisplayName}
        />
      </Form>
    );

    const loggedInLanding = (
      <>
        <div className="twocolumn">
          <div className="Home-joinroom">{joinRoomForm}</div>
          <div className="Home-newroom">{newRoomForm}</div>
        </div>
        <Divider />
        <RoomList user={this.props.user?.username} />
        <Divider />
        {updateDisplayName}
      </>
    );

    // Render the homePage if this.props.user exists (user is logged in),
    //   else render login page
    return <>{this.props.user ? loggedInLanding : loggedOutLanding}</>;
  }
}

export default Home;
