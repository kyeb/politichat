import React, { Component } from "react";

class VideoChat extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      localVideo: null,
    };
    this.videoRef = React.createRef();
  }

  initializeLocalVideo = () => {
    const constraints = {
      video: true,
      // Settings for higher quality audio
      audio: {
        sampleRate: 48000,
        sampleSize: 16,
      },
    };

    // Request webcam/audio access from user
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => {
        this.setState({ localVideo: mediaStream });
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {
    this.initializeLocalVideo();
  }

  render() {
    return (
      <div>
        {/* Set to muted later */}
        <h2>self video:</h2>
        {this.state.localVideo && (
          <video
            id="localVideo"
            autoPlay
            ref={(video) => {
              if (video) video.srcObject = this.state.localVideo;
            }}
          ></video>
        )}
        {/* <video id="remoteVideo" autoPlay></video> */}
      </div>
    );
  }
}

export default VideoChat;
