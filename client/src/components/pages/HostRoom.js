import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Loader } from "semantic-ui-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import VideoChat from "../modules/VideoChat";
import { post, error } from "../../utilities";
import { socket } from "../../client-socket.js";

class HostRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queueLength: this.props.room ? this.props.room.queue.length : 0,
      copied: false
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
          navigate("/exit/host/null");
        } else {
          error(res, "did not delete from array");
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
          <CopyToClipboard text={this.props.room.id} onCopy={() => this.setState({ copied: true })}>
            <Button floated="right">{this.state.copied ? "Room ID copied!" : "Copy room ID"}</Button>
          </CopyToClipboard>
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
