import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Loader } from "semantic-ui-react";

import VideoChat from "../modules/VideoChat";
import { post, error } from "../../utilities";
import { socket } from "../../client-socket";

class UserRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      position: null,
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
  };

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
          <p>While you're waiting, check out <a href= {this.props.room.link} target= "_blank" > my website!</a></p>
        </>
      );
    }

    // Set up a video chat if we got a room back from API, otherwise show loader
    let jitsi;
    if (this.props.room && this.props.room.id) {
      jitsi = <VideoChat room={this.props.room} />;
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
