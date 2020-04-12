import React, { Component } from "react";
import { Loader, Button, Divider, Message } from "semantic-ui-react";
import { get, error } from "../../utilities";
import { navigate } from "@reach/router";

class ExitPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room: null,
    };
  }

  componentDidMount() {
    if (this.props.roomID) {
      get("/api/room", { id: this.props.roomId })
        .then((room) => {
          this.setState({ room });
        })
        .catch((err) => error(err, "Couldn't get room info."));
    }
  }

  render() {
    if (this.props.reason === "done") {
      if (!this.state.room) {
        return <Loader active />;
      }
      return (
        <>
          <h3>Thank you for chatting with {this.state.room.owner}!</h3>
          <Button onClick={() => navigate("/")} content="Exit" />
        </>
      );
    }
    if (this.props.reason === "host") {
      return (
        <>
          <h3>
            Thank you for hosting a room on Politichat
            {this.props.user && <>, {this.props.user.username}</>}!
          </h3>
          <p>
            Please send any questions or feedback to
            <a href="mailto:politichat@mit.edu"> politichat@mit.edu</a>
          </p>
          <Button onClick={() => navigate("/")} content="Exit" />
        </>
      );
    }
    if (this.props.reason === "roomgone") {
      return (
        <>
          <h3>Thank you for using Politichat!</h3>
          <p>This room has ended.</p>
          <Button onClick={() => navigate("/")} content="Exit" />
        </>
      );
    }

    return <Message negative>Something went wrong...</Message>;
  }
}

export default ExitPage;
