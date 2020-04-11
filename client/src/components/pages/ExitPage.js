import React, { Component } from "react";
import { Loader, Button, Divider } from "semantic-ui-react";
import { get } from "../../utilities";
import { navigate } from "@reach/router";

class ExitPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room: null,
    };
  }

  componentDidMount() {
    get("/api/room", { id: this.props.roomId }).then((room) => {
      this.setState({ room });
    });
  }

  render() {
    if (this.state.room) {
      return (
        <>
          <h3>Thank you for chatting with {this.state.room.owner}!</h3>
          <Button onClick={() => navigate("/")} content="Exit" />
        </>
      );
    } else {
      return <Loader active />;
    }
  }
}

export default ExitPage;
