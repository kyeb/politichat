import React, { Component } from "react";
import { Table, Message, Divider, Loader, Button, Label } from "semantic-ui-react";
import { get, post } from "../../utilities";
import UserRow from "../modules/UserRow.js";
import RoomRow from "../modules/RoomRow";

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      rooms: [],
      roomCount: null,
    };
  }

  load() {
    this.setState({ loaded: true });
  }

  handleClearEnded = () => {
    post("/api/room/clean").then((res) => {
      if (res.success) {
        window.location.reload(false);
      }
    });
  };

  componentDidMount() {
    get("/api/user/list").then((users) => this.setState({ users }));
    get("/api/room/list").then((rooms) => this.setState({ rooms }));
    get("/api/room/count").then((roomCount) => this.setState(roomCount));
    this.timeout = setTimeout(this.load.bind(this), 500);
  }

  componentwillunmount() {
    if (this.timeout) {
      cleartimeout(this.timeout);
    }
  }

  render() {
    if (!this.props.user && !this.state.loaded) {
      return <Loader active />;
    }

    let cleanUpOptions;
    if (this.state.roomCount) {
      cleanUpOptions = (
        <>
          <Button negative floated="right" onClick={this.handleClearEnded}>
            Delete all ended rooms
          </Button>
          <Label>
            Total rooms in database: <Label.Detail>{this.state.roomCount}</Label.Detail>
          </Label>
        </>
      );
    }

    var adminPanel = (
      <>
        <h2>Settings</h2>
        {cleanUpOptions}
        <Divider />
        <h2>Users</h2>
        <Table>
          <Table.Body>
            {this.state.users.map((user) => {
              return <UserRow key={user.id} user={user} self={this.props.user} />;
            })}
          </Table.Body>
        </Table>
        <Divider />
        <h2>Open Rooms</h2>
        <Table>
          <Table.Body>
            {this.state.rooms.map((room) => {
              return <RoomRow key={room.id} room={room} />;
            })}
          </Table.Body>
        </Table>
      </>
    );
    return (
      <div>
        <h1>Admin Panel</h1>
        {this.props.user ? (
          this.props.user.admin ? (
            adminPanel
          ) : (
            <Message negative>You must be an admin to view this page.</Message>
          )
        ) : (
          <Message negative>You must be logged in to view this page.</Message>
        )}
      </div>
    );
  }
}

export default AdminPanel;
