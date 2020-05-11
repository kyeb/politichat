import React, { PureComponent } from "react";
import { Table, Button } from "semantic-ui-react";
import { post } from "../../utilities";

class RoomRow extends PureComponent {
  constructor(props) {
    super(props);
  }

  handleDelete = () => {
    post("/api/endroom", { id: this.props.room.id })
      .then((res) => {
        if (res.success) {
          window.location.reload(false);
        } else {
          console.log(res);
        }
      })
      .catch((err) => console.log(err));
  };

  render() {
    return (
      <Table.Row>
        <Table.Cell>{this.props.room.owner}</Table.Cell>
        <Table.Cell>{this.props.room.roomName}</Table.Cell>
        <Table.Cell>{this.props.room.queue.length} users in queue</Table.Cell>
        <Table.Cell collapsing>
          <Button onClick={this.handleDelete} negative>
            Delete
          </Button>
        </Table.Cell>
      </Table.Row>
    );
  }
}

export default RoomRow;
