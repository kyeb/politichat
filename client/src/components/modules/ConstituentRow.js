import React, { PureComponent } from "react";
import { Table, Button } from "semantic-ui-react";
import { post } from "../../utilities";

class ConstituentRow extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleJump = () => {
    post("/api/jump", { id: this.props.room.id, user: this.props.user.id })
      .then((res) => {
        if (res.success) {
            this.setState({ ready: true });
        } else {
          error(res, "No participants available");
        }
      })
      .catch((err) => {
        error(err, "POST to /api/jump failed.");
      });
  };

//   handleTable = () => {
//     let table = [];
//     table.push(
//     let children = [];
//     children.push(<Table.Cell textAlign = "left">{this.state.queueList[i].name} </Table.Cell>);
//     children.push(<Table.Cell textAlign = "left">{this.state.queueList[i].town}</Table.Cell>);
//     children.push(<Button primary size = "mini" compact onClick={this.handleJump()} floated="right" >Add participant</Button>)
//     // Create the parent and add the children
//     table.push(<Table.Row children={children}></Table.Row>);
//   };

  render() {
    return (
        <Table.Row>
            <Table.Cell textAlign = "left" >{this.props.name}</Table.Cell>
            <Table.Cell textAlign = "left" >{this.props.town}</Table.Cell>
            <Table.Cell>
                <Button primary size = "mini" compact onClick={this.handleJump} floated="right" >Add participant</Button>
            </Table.Cell>
         </Table.Row>
    );
  }
}

export default ConstituentRow;
