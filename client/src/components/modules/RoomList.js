import React, { Component } from "react";
import { Loader, Table, Message } from "semantic-ui-react";
import { get } from "../../utilities";
import RoomListEntry from "./RoomListEntry";

class RoomList extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      loading: true,
      rooms: [],
    };
  }

  componentDidMount() {
    get("/api/rooms").then((rooms) => {
      this.setState({ rooms: rooms, loading: false });
    });
  }

  render() {
    if (this.state.loading) {
      return <Loader active />;
    }

    const availableRooms = [];

    for (const [index, room] of this.state.rooms.entries()) {
      availableRooms.push(<RoomListEntry room={room} key={index} />);
    }

    if (availableRooms.length === 0) {
      return (
        <Message>
          Sorry, there are no available public rooms right now. Check back again later, or create
          one yourself!
        </Message>
      );
    }

    return (
      <>
        <h2>Open rooms</h2>
        <Table celled>
          <Table.Body>{availableRooms}</Table.Body>
        </Table>
      </>
    );
  }
}

export default RoomList;
