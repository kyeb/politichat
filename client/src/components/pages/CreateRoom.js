import React, { Component } from "react";
import { Form, Message } from "semantic-ui-react";
import { post } from "../../utilities";
import { navigate } from "@reach/router";

class CreateRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newRoomName: "",
      newRoomLink: "",
      newRoomWaiting: "",
      newRoomExit: "",
      newRoomPrivate: true
    };
  }

  componentDidMount() {}

  handleNewRoom = () => {
    post("/api/newroom", {
      roomName: this.state.newRoomName,
      roomLink: this.state.newRoomLink,
      waitingMessage: this.state.newRoomWaiting,
      exitMessage: this.state.newRoomExit,
      isPrivate: this.state.newRoomPrivate
    }).then((room) => {
      navigate(`/room/${room.id}`);
    }).catch((err) => {
      alert(
        "Something went wrong! Try a different name or reloading.\n\nTip: room names cannot contain special characters, and make sure the URL is valid."
      );
    });
  };

  render() {
    let roomNameInput = (
      <Form.Input
        className="newroom-name"
        placeholder="Room name"
        onChange={(event) => this.setState({ newRoomName: event.target.value })}
        value={this.state.newRoomName}
        width={5}
      />
    );

    let roomLinkInput = (
      <Form.Input
        className="newroom-link"
        placeholder="Link to your website!"
        onChange={(event) => this.setState({ newRoomLink: event.target.value })}
        value={this.state.newRoomLink}
        width={5}
      />
    );

    let waitingMessageTextarea = (
      <Form.TextArea
        label="Waiting room message"
        placeholder="This is what people will see while waiting to chat with you!"
        onChange={(event) => this.setState({ newRoomWaiting: event.target.value })}
        value={this.state.newRoomWaiting}
      />
    );

    let exitMessageTextarea = (
      <Form.TextArea
        label="Exit room message"
        placeholder="This is what people will see after chatting with you!"
        onChange={(event) => this.setState({ newRoomExit: event.target.value })}
        value={this.state.newRoomExit}
      />
    );

    let roomPrivateCheckbox = (
      <Form.Checkbox
        checked={this.state.newRoomPrivate}
        label={<label>Private</label>}
        onChange={(event) => this.setState((prevState) => ({ newRoomPrivate: !prevState.newRoomPrivate }))}
      />
    );

    let submitButton = (
      <Form.Button primary className="newroom-button" onClick={this.handleNewRoom}>
        Create room
      </Form.Button>
    );

    return (
      <div className="newroom-container">
        <h2>Create a new room</h2>
        <Form>
          {roomNameInput}
          {roomLinkInput}
          {waitingMessageTextarea}
          {exitMessageTextarea}
          {roomPrivateCheckbox}
          {submitButton}
        </Form>
      </div>
    );
  };
};

export default CreateRoom;
