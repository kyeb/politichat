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
    };
    // Let user into the room when the server says it's time
    socket.on("host ready", () => {
      this.setState({ ready: true });
    });
    socket.on("connect", () => {
      this.joinRoom();
    });
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
          <Button onClick={() => navigate("/")}>Leave queue</Button>
          <div>Waiting in line to speak to {this.props.room.owner}...</div>
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
        <Button onClick={() => navigate(`/exit/${this.props.room.id}`)}>Leave Room</Button>
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
