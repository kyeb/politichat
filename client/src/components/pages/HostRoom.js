import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Loader } from "semantic-ui-react";

import VideoChat from "../modules/VideoChat";
import { post, error } from "../../utilities";
import { socket } from "../../client-socket.js";

class HostRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queueLength: 0,
    };
    socket.on("queue status", (queueLength) => {
      this.setState({ queueLength });
    });
  }

  componentDidMount() {}

  handleNext = () => {
    post("/api/next", { id: this.props.room.id })
      .then((res) => {
        if (res.success) {
          this.setState({ ready: true });
        } else {
          error(res, "No participants available");
        }
      })
      .catch((err) => {
        error(err, "POST to /api/next failed.");
      });
  };

  handleEnd = () => {
    post("/api/end", { id: this.props.room.id })
      .then((res) => {
        if (res.success) {
          navigate("/");
        } else {
          error(res, "did not delete from array")
        } 
      })
      .catch((err) => {
        error(err, "POST to /api/end failed.");
      });
  };

  render() {
    // Set up a video chat if we got a room back from API, otherwise show loader
    let jitsi;
    if (this.props.room && this.props.room.id) {
      jitsi = <VideoChat room={this.props.room} />;
    } else {
      jitsi = <Loader active />;
    }
    const controller = (
      <div className="controller-owner">
        <div>
          <Button primary disabled={this.state.queueLength === 0} onClick={this.handleNext}>
            Next participant
          </Button>
          <Button negative floated="right" onClick={this.handleEnd}>
            End session
          </Button>
        </div>
        <div>Number of participants in queue: {this.state.queueLength}</div>
      </div>
    );

    return (
      <>
        {controller}
        {jitsi}
      </>
    );
  }
}

export default HostRoom;
