import React, { Component } from "react";
import { Loader, Button } from "semantic-ui-react";
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
    // if (this.state.room) {
    return (
      <>
        <div>Thank you for chatting with {/*this.state.room.owner*/}!</div>
        <Button onClick={() => navigate("/")} content="Exit" />
      </>
    );
    // } else {
    //   return <Loader active />;
    // }
  }
}

export default ExitPage;
