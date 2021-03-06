import React, { Component } from "react";

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
      roomName: this.props.room.roomName,
      height: 0.75 * window.innerHeight,
      parentNode: this.jitsiContainer,
      interfaceConfigOverwrite: {
        // Documentation for these options: https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: "Participant",
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "fullscreen",
          "fodeviceselection",
          "profile",
          "settings",
          "filmstrip",
        ],
        VIDEO_QUALITY_LABEL_DISABLED: true,
      },
      userInfo: {
        displayName: this.props.user ? this.props.user.displayName : "Participant",
      },
    };

    const api = new JitsiMeetExternalAPI(jitsiDomain, jitsiOptions);
    api.on("videoConferenceJoined", this.handleVideoJoined);
    this.setState({ api: api });
  }

  render() {
    return (
      <>
        <h2></h2>
        <div className="jitsi-container" ref={(el) => (this.jitsiContainer = el)} />
      </>
    );
  }
}

export default VideoChat;
