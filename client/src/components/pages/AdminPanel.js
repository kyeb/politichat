import React, { Component } from "react";
import { Table, Message, Divider } from "semantic-ui-react";
import { get } from "../../utilities";
import UserRow from "../modules/UserRow.js";
import RoomRow from "../modules/RoomRow";

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // These arrays are not kept in sync with changes visually on the page or on the server.
      users: [],
      rooms: [],
    };
  }

  componentDidMount() {
    get("/api/users").then((users) => {
      this.setState({ users });
    });
    get("/api/rooms").then((rooms) => {
      this.setState({ rooms });
    });
  }

  render() {
    var adminPanel = (
      <>
        <h2>Settings</h2>
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
