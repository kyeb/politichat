import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Divider, Form, Input, Label, Loader, Message } from "semantic-ui-react";

import VideoChat from "../modules/VideoChat";
import { post, error } from "../../utilities";
import { socket } from "../../client-socket";

class UserRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailAddress: "",
      emailError: "",
      emailSubmitted: false,
      ready: false,
      position: null,
      displayName: "",
      isFuture: false
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
      if (this.state.ready) {
        this.exitLine();
      } else {
        this.roomGone();
      }
    });
    socket.on("position update", (position) => {
      this.setState({ position });
    });

    let curTime = new Date().getTime();
    if (this.props.room.isScheduled &&
        this.props.room.datetime > curTime) {
      this.state.isFuture = true;

      let clearFuture = () => {
        this.setState({ isFuture: false });
      };
      this.timeout = setTimeout(clearFuture.bind(this), this.props.room.datetime - curTime);
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
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
    let pattern = /\S+@\S+\.\S+/;
    if (pattern.test(this.state.emailAddress)) {
      this.setState({
        emailSubmitted: true,
        emailError: ""
      });

      post("/api/submitEmail", { roomID: this.props.room.id, email: this.state.emailAddress })
        .then(() => {})
        .catch((err) => error(err, "Submitting email failed"));
    } else {
      this.setState({ emailError: "Enter a valid email address" });
    }
  }

  componentDidMount() {
    if (socket.id) {
      this.joinRoom();
    }
  }

  render() {
    if (!this.state.ready) {
      let emailErrorLabel = <div />;
      if (this.state.emailError) {
        emailErrorLabel = (
          <Label pointing prompt>
            {this.state.emailError}
          </Label>
        );
      }

      let websiteLink = <div />;
      if (this.props.room.link) {
        websiteLink = <p>
          While you're waiting, check out{" "}
          <a href={this.props.room.link} target="_blank">
            {" "}
            my website!
          </a>
        </p>;
      }

      let futureMessage = <></>;
      if (this.state.isFuture) {
        futureMessage = <Message color="orange">
          This room hasn't begun yet!
        </Message>;
      }

      return (
        <>
          {futureMessage}
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
          {websiteLink}
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
            <Form.Field className="userroom-email">
              <Input
                className="userroom-emailaddr"
                placeholder="Email address"
                onChange={(event) => this.setState({ emailAddress: event.target.value })}
                value={this.state.emailAddress}
                disabled={this.state.emailSubmitted}
              />
              {emailErrorLabel}
            </Form.Field>
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
