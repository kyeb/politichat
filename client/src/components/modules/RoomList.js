import React, { Component } from "react";
import { Loader, Table, Message } from "semantic-ui-react";
import { get } from "../../utilities";
import RoomListEntry from "./RoomListEntry";
import { socket } from "../../client-socket";

class RoomList extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      loading: true,
      rooms: [],
    };
    socket.on("new room", (newRoom) => {
      this.setState({ rooms: this.state.rooms.concat(newRoom) });
    });
    socket.on("room ended", (oldRoom) => {
      this.setState({ rooms: this.state.rooms.filter((e) => e.id !== oldRoom.id) });
    });
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
    const futureRooms = [];

    for (const [index, room] of this.state.rooms.entries()) {
      if (!room.isPrivate) {
        let isFuture = false;
        if (room.isScheduled) {
          if (room.datetime > new Date().getTime()) {
            isFuture = true;
          }
        }

        if (isFuture) {
          futureRooms.push(<RoomListEntry room={room} key={index} />);
        } else {
          availableRooms.push(<RoomListEntry room={room} key={index} />);
        }
      }
    }

    let currentRooms = (
      <Message>
        Sorry, there are no available public rooms right now. Check back again later, or create
        one yourself!
      </Message>
    );
    if (availableRooms.length > 0) {
      currentRooms = (
        <>
          <h2>Open rooms</h2>
          <Table celled>
            <Table.Body>{availableRooms}</Table.Body>
          </Table>
        </>
      );
    }

    let upcomingRooms = <div/>;
    if (futureRooms.length > 0) {
      upcomingRooms = (
        <>
          <h2>Upcoming rooms</h2>
          <Table celled>
            <Table.Body>{futureRooms}</Table.Body>
          </Table>
        </>
      );
    }

    return (
      <>
        {currentRooms}
        {upcomingRooms}
      </>
    );
  }
}

export default RoomList;
