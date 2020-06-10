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
    get("/api/room/list").then((rooms) => {
      this.setState({ rooms: rooms, loading: false });
    });
  }

  compareEntries(a, b) {
    a = a.props.room;
    b = b.props.room;
    let aisfuture = a.isScheduled && a.datetime > new Date().getTime();
    let bisfuture = b.isScheduled && b.datetime > new Date().getTime();
    if (aisfuture !== bisfuture) {
      // future ones last
      return aisfuture - bisfuture;
    }

    if (aisfuture) {
      // later starts last
      return a.datetime - b.datetime;
    }

    // stable
    return -1;
  }

  render() {
    if (this.state.loading) {
      return <Loader active />;
    }

    let makeTableHeader = (headings) => (
      <Table.Row>
        {headings.map((header, index) => (
          <Table.HeaderCell key={index}>{header}</Table.HeaderCell>
        ))}
      </Table.Row>
    );

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

        if (room.owner === this.props.user) {
          let ownedEntry = <RoomListEntry room={room} key={index} owned={true} />;
          myRooms.push(ownedEntry);
        }

        let entry = <RoomListEntry room={room} key={index} />;
        if (!room.isPrivate) {
          if (isFuture) {
            futureRooms.push(entry);
          } else {
            availableRooms.push(entry);
          }
        }
      }
    }

    // sort rooms
    myRooms.sort(this.compareEntries);
    futureRooms.sort(this.compareEntries);
    availableRooms.sort(this.compareEntries);

    let ownedRooms = <div />;
    if (myRooms.length > 0) {
      ownedRooms = (
        <>
          <h2>My rooms</h2>
          <Table celled columns={4}>
            <Table.Header>
              {makeTableHeader(["Host", "Room name", "Room access", "Copy link"])}
            </Table.Header>
            <Table.Body>{myRooms}</Table.Body>
          </Table>
        </>
      );
    }

    let currentRooms = (
      <Message>
        There are no available public rooms right now. Check back again later, or create one
        yourself!
      </Message>
    );
    if (availableRooms.length > 0) {
      currentRooms = (
        <>
          <h2>Open rooms</h2>
          <Table celled columns={3}>
            <Table.Header>{makeTableHeader(["Host", "Room name", "Room link"])}</Table.Header>
            <Table.Body>{availableRooms}</Table.Body>
          </Table>
        </>
      );
    }

    let upcomingRooms = <div />;
    if (futureRooms.length > 0) {
      upcomingRooms = (
        <>
          <h2>Upcoming rooms</h2>
          <Table celled columns={3}>
            <Table.Header>{makeTableHeader(["Host", "Room name", "Start time"])}</Table.Header>
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
