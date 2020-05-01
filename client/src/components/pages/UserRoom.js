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
      emailError: "",
      infoSubmitted: false,
      InQueue: false,
      position: null,
      userInfo: {
        name: "",
        email: "",
        phone: "",
        town: ""
      },
      joinedQueue: false,
      isFuture: false
    };
    // Let user into the room when the server says it's time
    socket.on("host ready", () => {
      this.setState({ inCall: true });
    });
    // If user reloads page, re-join the room
    //socket.on("connect", () => {
    //  this.joinRoom();
    //}); @kye what does this do? when I reload this isn't triggered (it just rerenders)
    socket.on("leave please", () => {
      this.exitLine();
    });
    socket.on("room gone", () => {
      if (this.state.inCall) {
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

  handleJoinQueue() {
    post("/api/join", { roomID: this.props.room.id, socketID: socket.id, name: this.state.userInfo.name })
      .then(() => {})
      .catch((err) => error(err, "Joining room failed"));
    this.setState({ joinedQueue: true });
  }

  handleSubmitInfo() {
    let pattern = /\S+@\S+\.\S+/;
    if (pattern.test(this.state.userInfo.email)) {
      this.setState({
        infoSubmitted: true,
        emailError: ""
      });

      post("/api/submitInfo", { roomID: this.props.room.id, socketID: socket.id, userInfo: this.state.userInfo })
        .then(() => {})
        .catch((err) => error(err, "Submitting information failed"));
    } else {
      this.setState({ emailError: "Enter a valid email address" });
    }
  }

  render() {
    if (!this.state.joinedQueue) {
      return (
        <>
          <p>Enter your name below to join the queue to speak with {this.props.room.owner}!</p>
          <Form>
            <Form.Input
              className="userroom-name"
              placeholder="Enter your name"
              onChange={(event) => this.setState({
                userInfo: {
                  ...this.state.userInfo,
                  name: event.target.value
                }
              })}
              value={this.state.userInfo.name}
            />
            <Form.Button
              primary
              className="userroom-namebutton"
              onClick={this.handleJoinQueue.bind(this)}
              type="button"
            >
              Join Queue
            </Form.Button>
          </Form>
        </>
      );
    }

    if (!this.state.inCall) {
      let futureMessage = <></>;
      if (this.state.isFuture) {
        futureMessage = <Message color="orange">
          This room hasn't begun yet!
        </Message>;
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

      let emailErrorLabel = <div />;
      if (this.state.emailError) {
        emailErrorLabel = (
          <Label pointing prompt>
            {this.state.emailError}
          </Label>
        );
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
          <Divider />
          <p>Enter your email address to stay updated!</p>
          <Form>
            <Form.Field className="userroom-info">
              <Input
                className="userroom-email"
                placeholder="Email address"
                onChange={(event) => this.setState({
                  userInfo: {
                    ...this.state.userInfo,
                    email: event.target.value
                  }
                })}
                value={this.state.userInfo.email}
              />
              {emailErrorLabel}
            </Form.Field>
            <Form.Button
              primary
              className="userroom-infobutton"
              onClick={this.handleSubmitInfo.bind(this)}
            >
              {this.state.infoSubmitted ? "Update" : "Submit"}
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
