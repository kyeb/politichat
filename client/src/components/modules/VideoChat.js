import React, { Component } from "react";
import { Loader } from "semantic-ui-react";

class VideoChat extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      api: null,
    };
  }

  handleVideoJoined = () => {};

  componentDidMount() {
    const jitsiDomain = "jitsi.kyeburchard.com";
    const jitsiOptions = {
      roomName: this.props.room.id,
      height: 500,
      parentNode: this.jitsiContainer,
      interfaceConfigOverwrite: {
        // Documentation for these options: https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: "",
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "fullscreen",
          "fodeviceselection",
          "hangup",
          "profile",
          "recording",
          "etherpad",
          "settings",
          "filmstrip",
          "feedback",
          "shortcuts",
          "videobackgroundblur",
          "download",
          "help",
          "mute-everyone",
        ],
        VIDEO_QUALITY_LABEL_DISABLED: true,
      },
    };

    const api = new JitsiMeetExternalAPI(jitsiDomain, jitsiOptions);
    api.on("videoConferenceJoined", this.handleVideoJoined);
    this.setState({ api: api });
  }

  render() {
    return (
      <>
        <h2>here's the video chat component</h2>
        <div className="jitsi-container" ref={(el) => (this.jitsiContainer = el)} />
      </>
    );
  }
}

export default VideoChat;
