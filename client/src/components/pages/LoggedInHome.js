import React, { Component } from "react";
import AuthController from "../modules/AuthController";
import RoomList from "../modules/RoomList";
import { Form, Input, Label, Message, Divider, Loader } from "semantic-ui-react";
import { get, post } from "../../utilities";
import { navigate } from "@reach/router";

class LoggedInHome extends Component {
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

    return (
      <>
        <div className="twocolumn">
          <div className="Home-newroom">{newRoomForm}</div>
        </div>
        <Divider />
        <RoomList user={this.props.user?.username} />
        <Divider />
        {updateDisplayName}
      </>
    );
  }
}

export default LoggedInHome;
