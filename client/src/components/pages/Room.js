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
    get("/api/room", { id: this.props.roomId }).then((room) => {
      this.setState({ room });
    });
  }

  participantController = () => {
    return (
      <div className="controller-participant">
        <Button onClick={() => navigate(`/exit/${this.props.roomId}`)}>Leave Room</Button>
      </div>
    );
  };

  ownerController = () => {
    return (
      <div className="controller-owner">
        <Button>Next participant</Button>
      </div>
    );
  };

  render() {
    let jitsi;
    if (this.state.room && this.state.room.id) {
      jitsi = <VideoChat room={this.state.room} />;
    } else {
      jitsi = <Loader active />;
    }

    let controller;
    if (this.props.user && this.state.room && this.props.user == this.state.room.owner) {
      controller = this.ownerController();
    } else {
      controller = this.participantController();
    }

    return (
      <>
        {controller}
        {jitsi}
      </>
    );
  }
}

export default Room;
