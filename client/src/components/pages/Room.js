import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Loader } from "semantic-ui-react";

import VideoChat from "../modules/VideoChat";
import { get } from "../../utilities";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room: null,
    };
  }

  componentDidMount() {
    get("/api/rooms", { roomId: this.props.roomId }).then((room) => {
      this.setState({ room });
    });
  }

  goHome = () => {
    navigate("/");
  };

  render() {
    let jitsi;
    if (this.state.room && this.state.room.id) {
      jitsi = <VideoChat room={this.state.room} />;
    } else {
      jitsi = <Loader active />;
    }

    return (
      <>
        <Button onClick={this.goHome}>Leave Room</Button>
        {jitsi}
      </>
    );
  }
}

export default Room;
