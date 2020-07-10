import React, { Component } from "react";
import { Form, Loader, Message } from "semantic-ui-react";
import { DateTimeInput } from "semantic-ui-calendar-react";
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
      newRoomPrivate: true,
      newRoomScheduled: false,
      newRoomDatetime: "",
    };
  }

  handleNewRoom = () => {
    // parse date string in format "MM-DD-YYYY hh:mm A" TODO add validity checking
    let datetime = 0;
    if (this.state.newRoomScheduled) {
      let parts = this.state.newRoomDatetime.split(/[- :]/);
      if (parts.length !== 6) {
        alert("Scheduled time invalid");
      }
      if (parts[5] === "AM") {
        parts[3] = parts[3] === "12" ? 0 : parts[3];
      } else {
        parts[3] = parts[3] === "12" ? 12 : 12 + parseInt(parts[3]);
      }
      parts = parts.slice(0, -1).map((x) => parseInt(x));
      datetime = new Date(parts[2], parts[0] - 1, parts[1], parts[3], parts[4]).getTime();
    }

    post("/api/room/new", {
      roomName: this.state.newRoomName,
      roomLink: this.state.newRoomLink,
      waitingMessage: this.state.newRoomWaiting,
      exitMessage: this.state.newRoomExit,
      isPrivate: this.state.newRoomPrivate,
      isScheduled: this.state.newRoomScheduled,
      datetime: datetime,
    })
      .then((room) => {
        if (this.state.newRoomScheduled) {
          // if room is in the future, return to homepage
          navigate("/dashboard");
        } else {
          navigate(`/room/${room.id}`);
        }
      })
      .catch((err) => {
        alert(
          "Something went wrong! Try a different name or reloading.\n\nTip: room names cannot contain special characters, and make sure the URL is valid."
        );
      });
  };

  load() {
    this.setState({ loaded: true });
  }

  componentDidMount() {
    this.timeout = setTimeout(this.load.bind(this), 500);
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    if (!this.props.user && !this.state.loaded) {
      return <Loader active />;
    }

    if (!this.props.user) {
      return (
        <div>
          <h2>Create a new room</h2>
          <Message negative>You must be logged in to view this page.</Message>
        </div>
      );
    } else if (!this.props.user.canCreateRooms) {
      return (
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
        onChange={(event) =>
          this.setState((prevState) => ({ newRoomPrivate: !prevState.newRoomPrivate }))
        }
      />
    );

    let roomScheduledCheckbox = (
      <Form.Checkbox
        checked={this.state.newRoomScheduled}
        label={<label>Schedule for later</label>}
        onChange={(event) =>
          this.setState((prevState) => ({ newRoomScheduled: !prevState.newRoomScheduled }))
        }
      />
    );

    let datetimePicker = <div />;
    if (this.state.newRoomScheduled) {
      datetimePicker = (
        <DateTimeInput
          closable
          closeOnMouseLeave={false}
          dateTimeFormat="MM-DD-YYYY hh:mm A"
          iconPosition="left"
          onChange={(event, { name, value }) => this.setState({ newRoomDatetime: value })}
          placeholder="Scheduled time"
          preserveViewMode={false}
          value={this.state.newRoomDatetime}
        />
      );
    }

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
          {roomScheduledCheckbox}
          {datetimePicker}
          {submitButton}
        </Form>
      </div>
    );
  }
}

export default CreateRoom;
