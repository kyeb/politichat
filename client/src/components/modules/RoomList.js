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

    const myRooms = [];
    const availableRooms = [];
    const futureRooms = [];

    for (const [index, room] of this.state.rooms.entries()) {
      if (!room.isPrivate || room.owner === this.props.user) {
        let isFuture = false;
        if (room.isScheduled) {
          if (room.datetime > new Date().getTime()) {
            isFuture = true;
          }
        }

        let entry = <RoomListEntry room={room} key={index} />;
        if (room.owner === this.props.user) {
          myRooms.push(entry);
        }

        if (!room.isPrivate) {
          if (isFuture) {
            futureRooms.push(entry);
          } else {
            availableRooms.push(entry);
          }
        }
      }
    }

    let ownedRooms = <div/>;
    if (myRooms.length > 0) {
      ownedRooms = (
        <>
          <h2>My rooms</h2>
          <Table celled>
            <Table.Body>{myRooms}</Table.Body>
          </Table>
        </>
      );
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
        {ownedRooms}
        {currentRooms}
        {upcomingRooms}
      </>
    );
  }
}

export default RoomList;
