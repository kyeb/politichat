import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Divider, Form, Input, Label, Loader, Message } from "semantic-ui-react";

import VideoChat from "../modules/VideoChat";
import { post, error } from "../../utilities";
import { socket } from "../../client-socket";

class UserRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailError: "",
      phoneError: "",
      InQueue: false,
      position: null,
      userInfo: {
        name: "",
        email: "",
        phone: "",
        town: "",
      },
      joinedQueue: false,
      isFuture: false,
    };
    // Let user into the room when the server says it's time
    socket.on("host ready", () => {
      this.setState({ inCall: true });
    });
    // If user reloads page, re-join the room
    //socket.on("connect", () => {
    //  this.joinRoom();
    //}); @kye what does this do? when I reload this isn't triggered (it just rerenders)
    socket.on("leave please", () => {
      this.exitLine();
    });
    socket.on("room gone", () => {
      if (this.state.inCall) {
        this.exitLine();
      } else {
        this.roomGone();
      }
    });
    socket.on("position update", (position) => {
      this.setState({ position });
    });

    let curTime = new Date().getTime();
    if (this.props.room.isScheduled && this.props.room.datetime > curTime) {
      this.state.isFuture = true;

      let clearFuture = () => {
        this.setState({ isFuture: false });
      };
      this.timeout = setTimeout(clearFuture.bind(this), this.props.room.datetime - curTime);
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  roomGone() {
    navigate("/exit/roomgone/null");
  }

  exitLine() {
    console.log("exiting line");
    navigate(`/exit/done/${this.props.room.id}`);
  }

  handleJoinQueue = () => {
    let emailOkay = !this.state.userInfo.email || /\S+@\S+\.\S+/.test(this.state.userInfo.email);
    let phoneOkay = !this.state.userInfo.phone || /^\d{10}$/.test(this.state.userInfo.phone);

    if (emailOkay && phoneOkay) {
      this.setState({
        emailError: "",
        phoneError: "",
      });

      post("/api/join", {
        roomID: this.props.room.id,
        socketID: socket.id,
        name: this.state.userInfo.name,
        email: this.state.userInfo.email, 
        phone: this.state.userInfo.phone, 
        town: this.state.userInfo.town
      })
        .then(() => {
        })
        .catch((err) => error(err, "Joining room failed"));
      this.setState({ joinedQueue: true });
    } else {
      this.setState({
        emailError: emailOkay ? "" : "Enter a valid email address",
        phoneError: phoneOkay ? "" : "Enter a valid phone number",
      });
    }
  };

  render() {
    if (!this.state.joinedQueue) {

      let makeErrorLabel = (error) => {
        if (error) {
          return (
            <Label pointing prompt>
              {error}
            </Label>
          );
        }
        return <></>;
      };

      return (
        <>
          <p>
            Enter your information below to join the queue to speak with {this.props.room.ownerDisplayName}
            !
          </p>    
          <Form>
            <Form.Field className="userroom-info">
              <Input
                className="userroom-name"
                placeholder="First and Last Name"
                onChange={(event) =>
                  this.setState({
                    userInfo: {
                      ...this.state.userInfo,
                      name: event.target.value,
                    },
                  })
                }
                value={this.state.userInfo.name}
              />
            </Form.Field>
            <Form.Field className="userroom-info">
              <Input
                className="userroom-email"
                placeholder="Email address"
                onChange={(event) =>
                  this.setState({
                    userInfo: {
                      ...this.state.userInfo,
                      email: event.target.value,
                    },
                  })
                }
                value={this.state.userInfo.email}
              />
              {makeErrorLabel(this.state.emailError)}
            </Form.Field>
            <Form.Field className="userroom-info">
              <Input
                className="userroom-phone"
                placeholder="Phone Number"
                onChange={(event) =>
                  this.setState({
                    userInfo: {
                      ...this.state.userInfo,
                      phone: event.target.value,
                    },
                  })
                }
                value={this.state.userInfo.phone}
              />
              {makeErrorLabel(this.state.phoneError)}
            </Form.Field>
            <Form.Field className="userroom-info">
              <Input
                className="userroom-town"
                placeholder="Town"
                onChange={(event) =>
                  this.setState({
                    userInfo: {
                      ...this.state.userInfo,
                      town: event.target.value,
                    },
                  })
                }
                value={this.state.userInfo.town}
              />
            </Form.Field>
            {/* <Form.Button
              primary
              className="userroom-infobutton"
              onClick={this.handleSubmitInfo.bind(this)}
              disabled={this.state.userInfo.name === "" || this.state.userInfo.email === "" || this.state.userInfo.town === ""}
            >
              {this.state.infoSubmitted ? "Update" : "Submit"}
            </Form.Button> */}
            <Form.Button
              primary
              className="userroom-infobutton"
              onClick={this.handleJoinQueue}
              type="button"
              disabled={this.state.userInfo.name === "" || this.state.userInfo.email === "" || this.state.userInfo.town === ""}
            >
              Join Queue
            </Form.Button>
          </Form>
        </>
      );
    }

    if (!this.state.inCall) {
      let futureMessage = <></>;
      if (this.state.isFuture) {
        futureMessage = <Message color="orange">This room hasn't begun yet!</Message>;
      }

      let rightColumn = (
        <div>
          <p>Enter your information to stay updated!</p>
        </div>
      );

      let websiteLink = <div />;
      if (this.props.room.link) {
        websiteLink = (
          <p>
            While you are waiting, check out{" "}
            <a href={this.props.room.link} target="_blank">
              {" " + this.props.room.ownerDisplayName + "'s website"}
            </a>
            !
          </p>
        );
      }
      let waitMessage = <div />;
      if (this.props.room.waitMessage) {
        waitMessage = (
          <div>
            <p className="ownerMessageHeader">
              Below is a message from {this.props.room.ownerDisplayName}:
            </p>
            <Divider hidden />
            <p className="ownerMessage">{this.props.room.waitMessage}</p>
          </div>
        );
      }
      let leftColumn = (
        <div className="UserRoom-customcontent">
          {websiteLink}
          {this.props.room.link && this.props.room.waitMessage ? <Divider hidden /> : <></>}
          {waitMessage}
        </div>
      );
      if (!this.props.room.link && !this.props.room.waitMessage) {
        leftColumn = rightColumn;
        rightColumn = <div />;
      }

      return (
        <>
          {futureMessage}
          <Button
            onClick={() => {
              post("/api/leavequeue", { roomID: this.props.room.id, socketID: socket.id });
              navigate("/");
            }}
            content="Leave queue"
            floated="right"
          />
          <h3>Waiting in line to speak to {this.props.room.ownerDisplayName}...</h3>
          {this.props.room.ownerDisplayName && <p>{this.props.room.ownerDisplayName} is currently speaking with constituents, but looks forward to speaking with you soon!</p>}
          <Divider section />
          <div className="twocolumn">
            {leftColumn}
            {rightColumn}
          </div>
        </>
      );
    }

    // Set up a video chat if we got a room back from API, otherwise show loader
    let jitsi;
    if (this.props.room && this.props.room.id) {
      jitsi = <VideoChat room={this.props.room} user={{ displayName: this.state.displayName }} />;
    } else {
      jitsi = <Loader active />;
    }

    const controller = (
      <div className="controller-participant">
        <Button onClick={() => navigate(`/exit/done/${this.props.room.id}`)}>Leave Room</Button>
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

export default UserRoom;
