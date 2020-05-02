import React, { PureComponent } from "react";
import { Table, Button } from "semantic-ui-react";
import { post } from "../../utilities";

class UserRow extends PureComponent {
  constructor(props) {
    super(props);
    // This state is duplicated from AdminPanel.state.users, but only updated here so
    //   the entire table isn't re-rendered whenever we make changes.
    this.state = {
      admin: this.props.user.admin,
      canCreateRooms: this.props.user.canCreateRooms,
    };
  }

  handleDelete = () => {
    post("/api/user/delete", { id: this.props.user.id })
      .then((res) => {
        if (res.success) {
          window.location.reload(false);
        } else {
          console.log(res);
        }
      })
      .catch((err) => console.log(err));
  };

  handleToggleAdmin = () => {
    post("/api/user/admin", { id: this.props.user.id, admin: !this.state.admin })
      .then(() => this.setState({ admin: !this.state.admin }))
      .catch((err) => console.log(err));
  };

  handleToggleWorker = () => {
    post("/api/user/updatepermissions", {
      id: this.props.user.id,
      canCreateRooms: !this.state.canCreateRooms,
    })
      .then(() => {
        // If you turn off a desk worker's status, also remove their admin access so they aren't
        // in a weird undefined UI state
        if (this.state.canCreateRooms && this.state.admin) {
          this.handleToggleAdmin();
        }
        this.setState({ canCreateRooms: !this.state.canCreateRooms });
      })
      .catch((err) => console.log(err));
  };

  render() {
    // Set name up so it's self-aware and doesn't error if this.props.user doesn't exist yet
    let name;
    if (this.props.user) {
      if (this.props.self.id === this.props.user.id) {
        name = this.props.user.username + " (You)";
      } else {
        name = this.props.user.username;
      }
    } else {
      name = null;
    }

    return (
      <Table.Row>
        <Table.Cell>{name}</Table.Cell>

        <Table.Cell>{this.props.user.displayName}</Table.Cell>

        <Table.Cell collapsing>
          <Button
            onClick={this.handleToggleWorker}
            primary={this.state.canCreateRooms}
            disabled={this.props.self.id === this.props.user.id}
          >
            Create rooms
          </Button>
        </Table.Cell>
        <Table.Cell collapsing>
          <Button
            onClick={this.handleToggleAdmin}
            primary={this.state.admin}
            disabled={this.props.self.id === this.props.user.id}
          >
            Admin
          </Button>
        </Table.Cell>
        <Table.Cell collapsing>
          <Button
            onClick={this.handleDelete}
            negative
            disabled={this.props.self.id === this.props.user.id}
          >
            Delete
          </Button>
        </Table.Cell>
      </Table.Row>
    );
  }
}

export default UserRow;
