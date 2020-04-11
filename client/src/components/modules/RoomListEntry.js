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
    return (
      <>
        <Table.Row>
          <Table.Cell>{this.props.room.owner}</Table.Cell>
          <Table.Cell>{this.props.room.roomName}</Table.Cell>
          <Table.Cell>
            <Button onClick={this.goTo} primary>
              Enter room
            </Button>
          </Table.Cell>
        </Table.Row>
      </>
    );
  }
}

export default RoomListEntry;
