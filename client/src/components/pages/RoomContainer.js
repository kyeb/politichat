import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Message, Loader } from "semantic-ui-react";

import { get } from "../../utilities";
import HostRoom from "./HostRoom";
import UserRoom from "./UserRoom";

class RoomContainer extends Component {
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
      .catch(() => {
        this.setState({ error: true });
      });
  }

  render() {
    if (this.state.error) {
      return (
        <>
          <Message negative>Sorry, this room does not seem to exist right now :/</Message>
          <Button onClick={() => navigate("/")}>Go home</Button>
        </>
      );
    }

    let room;
    if (this.props.user && this.state.room && this.props.user.username === this.state.room.owner) {
      room = <HostRoom room={this.state.room} user={this.props.user} />;
    } else if (this.state.room && this.props.socketConnected) {
      room = <UserRoom room={this.state.room} />;
    } else {
      room = <Loader />;
    }

    return room;
  }
}

export default RoomContainer;
