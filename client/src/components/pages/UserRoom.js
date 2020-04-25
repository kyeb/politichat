import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Divider, Form, Loader, Input } from "semantic-ui-react";

import VideoChat from "../modules/VideoChat";
import { post, error } from "../../utilities";
import { socket } from "../../client-socket";

class UserRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailAddress: "",
      emailSubmitted: false,
      ready: false,
      position: null,
      displayName: "",
    };
    // Let user into the room when the server says it's time
    socket.on("host ready", () => {
      this.setState({ ready: true });
    });
    // If user reloads page, re-join the room
    socket.on("connect", () => {
      this.joinRoom();
    });
    socket.on("leave please", () => {
      this.exitLine();
    });
    socket.on("room gone", () => {
      this.roomGone();
    });
    socket.on("position update", (position) => {
      this.setState({ position });
    });
  }

  roomGone() {
    navigate("/exit/roomgone/null");
  }

  exitLine() {
    console.log("exiting line");
    navigate(`/exit/done/${this.props.room.id}`);
  }

  joinRoom = () => {
    post("/api/join", { roomID: this.props.room.id, socketID: socket.id })
      .then(() => {})
      .catch((err) => error(err, "Joining room failed"));
  }

  handleSubmitEmail() {
    this.setState({ emailSubmitted: true });
    post("/api/submitEmail", { roomID: this.props.room.id, email: this.state.emailAddress })
      .then(() => {})
      .catch((err) => error(err, "Submitting email failed"));
  }

  componentDidMount() {
    if (socket.id) {
      this.joinRoom();
    }
  }

  render() {
    if (!this.state.ready) {
      return (
        <>
          <Button
            onClick={() => {
              post("/api/leavequeue", { roomID: this.props.room.id, socketID: socket.id });
              navigate("/");
            }}
          >
            Leave queue
          </Button>
          <p>Waiting in line to speak to {this.props.room.owner}...</p>
          {this.state.position && <p>You are position {this.state.position} in line.</p>}
          <p>
            While you're waiting, check out{" "}
            <a href={this.props.room.link} target="_blank">
              {" "}
              my website!
            </a>
          </p>
          <p> {this.props.room.waitMessage} </p>
          <br />
          <p>Set a name to appear as in the video chat:</p>
          <Input
            className="userroom-displayname"
            placeholder="Display name"
            onChange={(event) => this.setState({ displayName: event.target.value })}
            value={this.state.displayName}
          />
          <Divider />
          <p>Enter your email address to stay updated!</p>
          <Form>
            <Form.Input
              className="userroom-emailaddr"
              placeholder="Email address"
              onChange={(event) => this.setState({ emailAddress: event.target.value })}
              value={this.state.emailAddress}
              disabled={this.state.emailSubmitted}
            />
            <Form.Button
              primary
              className="userroom-emailbutton"
              onClick={this.handleSubmitEmail.bind(this)}
              disabled={!this.state.emailAddress || this.state.emailSubmitted}
            >
              {this.state.emailSubmitted ? "Submitted!" : "Submit"}
            </Form.Button>
          </Form>
        </>
      );
    }

    // Set up a video chat if we got a room back from API, otherwise show loader
    let jitsi;
    if (this.props.room && this.props.room.id) {
      jitsi = <VideoChat room={this.props.room} user={{ displayName: this.state.displayName }} />;
    } else {
      jitsi = <Loader active />;
    }

    const controller = (
      <div className="controller-participant">
        <Button onClick={() => navigate(`/exit/done/${this.props.room.id}`)}>Leave Room</Button>
      </div>
    );

    return (
      <>
        {controller}
        {jitsi}
      </>
    );
  }
}

export default UserRoom;
