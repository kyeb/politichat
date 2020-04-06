import React, { Component } from "react";
import { Loader } from "semantic-ui-react";

class VideoChat extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      loading: true,
      api: null,
    };
  }

  handleVideoJoined = () => {
    console.log("IT WORKED");
    this.setState({ loading: false });
  };

  componentDidMount() {
    const jitsiDomain = "meet.jit.si";
    const jitsiOptions = {
      roomName: "testRoomName",
      height: 500,
      parentNode: this.jitsiContainer,
    };

    const api = new JitsiMeetExternalAPI(jitsiDomain, jitsiOptions);
    api.on("videoConferenceJoined", this.handleVideoJoined);
    this.setState({ api: api });
  }

  render() {
    return (
      <>
        <Loader active={this.state.loading} />
        <div className="jitsi-container" ref={(el) => (this.jitsiContainer = el)} />
      </>
    );
  }
}

export default VideoChat;
