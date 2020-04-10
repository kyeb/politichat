import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Loader, Message, Divider } from "semantic-ui-react";

import VideoChat from "../modules/VideoChat";
import { get } from "../../utilities";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room: null,
      error: false,
    };
  }

  componentDidMount() {
    get("/api/room", { id: this.props.roomId })
      .then((room) => {
        this.setState({ room });
      })
      .catch((err) => {
        this.setState({ error: true });
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
        note: these buttons don't do anything yet <br />
        <Button primary onClick={this.handleNext}>
          Next participant
        </Button>
        <Button negative onClick={this.handleEnd}>
          End session
        </Button>
      </div>
    );
  };

  handleNext = () => {};

  handleEnd = () => {};

  render() {
    if (this.state.error) {
      return (
        <>
          <Message negative>Sorry, this room does not seem to exist right now :/</Message>
          <Button onClick={() => navigate("/")}>Go home</Button>
        </>
      );
    }

    // Set up a video chat if we got a room back from API, otherwise show loader
    let jitsi;
    if (this.state.room && this.state.room.id) {
      jitsi = <VideoChat room={this.state.room} />;
    } else {
      jitsi = <Loader active />;
    }

    let controller;
    if (this.props.user && this.state.room && this.props.user.username === this.state.room.user) {
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
