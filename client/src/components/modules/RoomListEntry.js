import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Table, Button } from "semantic-ui-react";

class RoomListEntry extends Component {
  constructor(props) {
    super(props);
  }

  goTo = () => {
    navigate(`/room/${this.props.room.id}`);
  };

  render() {
    let lastCell = (
      <Button onClick={this.goTo} primary>
        Enter room
      </Button>
    );
    if (this.props.room.isScheduled) {
      if (this.props.room.datetime > new Date().getTime()) {
        let dateFormat = require("dateformat");
        lastCell = dateFormat(this.props.room.datetime, "mm/dd/yyyy hh:MM TT");
      }
    }

    return (
      <>
        <Table.Row>
          <Table.Cell>{this.props.room.owner}</Table.Cell>
          <Table.Cell>{this.props.room.roomName}</Table.Cell>
          <Table.Cell>{lastCell}</Table.Cell>
        </Table.Row>
      </>
    );
  }
}

export default RoomListEntry;
