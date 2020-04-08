import React, { Component } from "react";
import { socket } from "../../client-socket.js";

const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};
const mediaConstraints = {
  video: true,
  // Settings for higher quality audio
  audio: {
    sampleRate: 48000,
    sampleSize: 16,
  },
};

class VideoChat extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      localVideo: null,
      remoteVideo: null,
      // pc: null,
    };
    this.videoRef = React.createRef();
  }

  componentDidMount() {
    this.initLocalVideo();
  }

  initLocalVideo = () => {
    // Request webcam/audio access from user
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((mediaStream) => {
        this.setState({ localVideo: mediaStream });
        this.initPeerConnection();
      })
      .catch((err) => console.log(err));
  };

  initPeerConnection = () => {
    const pc = new RTCPeerConnection(peerConnectionConfig);
    // this.setState({ pc });
    // Attach our video to the PeerConnection
    pc.addStream(this.state.localVideo);
    // Define how our PeerConnection responds to ICE candidates
    pc.onicecandidate = ({ candidate }) => {
      // socket.emit("videoPCSignal", {
      //   candidate,
      //   to:
      // })
    };
  };

  render() {
    return (
      <div>
        <h2>self video:</h2>
        {this.state.localVideo && (
          <video
            autoPlay
            muted
            ref={(video) => {
              if (video) video.srcObject = this.state.localVideo;
            }}
          ></video>
        )}
        {this.state.remoteVideo && (
          <video
            autoPlay
            muted
            ref={(video) => {
              if (video) video.srcObject = this.state.remoteVideo;
            }}
          ></video>
        )}{" "}
      </div>
    );
  }
}

export default VideoChat;
