import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Table, Button } from "semantic-ui-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

class RoomListEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copiedIds: [],
    };
  }

  goTo = () => {
    navigate(`/room/${this.props.room.id}`);
  };

  render() {
    let lastCell = (
      <Table.Cell textAlign="center">
        <Button onClick={this.goTo} primary>
          Enter room
        </Button>
      </Table.Cell>
    );
    if (this.props.room.isScheduled) {
      if (this.props.room.datetime > new Date().getTime()) {
        let dateFormat = require("dateformat");
        let premessage = this.props.owned ? "Starts at " : "";
        lastCell = (
          <Table.Cell>
            {premessage + dateFormat(this.props.room.datetime, "mm/dd/yyyy hh:MM TT")}
          </Table.Cell>
        );
      }
    }

    let copyLink = <></>;
    if (this.props.owned) {
      let linkToCopy = window.location.href.split("/")[2] + "/room/" + this.props.room.id;
      let newCopiedIds = [...this.state.copiedIds, this.props.room.id];
      let isCopied = this.state.copiedIds.includes(this.props.room.id);
      copyLink = (
        <Table.Cell textAlign="center">
          <CopyToClipboard
            text={linkToCopy}
            onCopy={() => this.setState({ copiedIds: newCopiedIds })}
          >
            <Button>{isCopied ? "Room link copied!" : "Copy room link"}</Button>
          </CopyToClipboard>
        </Table.Cell>
      );
    }

    if (this.state.copiedIds.length > 0) {
      // remove the "Room link copied!" after two seconds
      setTimeout(() => {
        this.setState({
          copiedIds: [],
        });
      }, 2000);
    }

    return (
      <>
        <Table.Row>
          <Table.Cell>{this.props.room.ownerDisplayName}</Table.Cell>
          <Table.Cell>{this.props.room.roomName}</Table.Cell>
          {lastCell}
          {copyLink}
        </Table.Row>
      </>
    );
  }
}

export default RoomListEntry;
