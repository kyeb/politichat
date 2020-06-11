import React, { PureComponent } from "react";
import { Table, Button } from "semantic-ui-react";
import { post } from "../../utilities";

class ConstituentRow extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleJump = () => {
    post("/api/queue/jump", { id: this.props.room.id, user: this.props.user.id })
      .then((res) => {
        if (res.success) {
          this.setState({ ready: true });
        } else {
          error(res, "No participants available");
        }
      })
      .catch((err) => {
        error(err, "POST to /api/queue/jump failed.");
      });
  };

  render() {
    return (
      <Table.Row>
        <Table.Cell textAlign="left">{this.props.name}</Table.Cell>
        <Table.Cell textAlign="left">{this.props.town}</Table.Cell>
        <Table.Cell>
          <Button primary size="mini" compact onClick={this.handleJump} floated="right">
            Add participant
          </Button>
        </Table.Cell>
      </Table.Row>
    );
  }
}

export default ConstituentRow;
