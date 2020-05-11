import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Loader, Message, Divider, Table } from "semantic-ui-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import VideoChat from "../modules/VideoChat";
import { post, error } from "../../utilities";
import { socket } from "../../client-socket.js";
import ConstituentRow from "../modules/ConstituentRow.js";

class HostRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queueList: [],
      isUser: false,
      queueLength: this.props.room ? this.props.room.queue.length : 0,
      copied: false,
    }; 
  }

  load() {
    this.setState({ loaded: true });
  }

  componentDidMount() {
    socket.on("queue status", (queueLength) => {
      console.log(queueLength); 
      this.setState({ queueLength });
    });
    socket.on("queue array", (queueList) => {
      this.setState({ queueList }); 
    })
    socket.on("is User?", (isUser) => {
      this.setState({ isUser })
    })
    this.timeout = setTimeout(this.load.bind(this), 500);
  }

  componentwillunmount() {
    if (this.timeout) {
      cleartimeout(this.timeout);
    }
  }

  handleKickUser = () => {
    post("/api/enduser", {id: this.props.room.id })
      .then((res) => {
        if (res.success) {
          this.setState( { isUser: false });
          this.setState({ ready: true });
        } else {
          error(res, "No participants currently in the chat");
        }
      })
      .catch((err) => {
        error(err, "POST to /api/enduser failed.");
      });
  }

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
    post("/api/endroom", { id: this.props.room.id })
      .then((res) => {
        if (res.success) {
          navigate(`/exit/host/${this.props.room.id}`);
        } else {
          error(res, "did not delete from array");
        }
      })
      .catch((err) => {
        error(err, "POST to /api/endroom failed.");
      });
  };


  render() {
    // Set up a video chat if we got a room back from API, otherwise show loader

    let jitsi;
    if (this.props.room && this.props.room.id) {
      jitsi = <VideoChat room={this.props.room} user={this.props.user} />;
    } else {
      jitsi = <Loader active />;
    }

    let leftColumn = (
      <div>
        {jitsi}
      </div>
    );
    
    let queueDisplay = <div />; 
    if(this.state.queueList.length !== 0){
      queueDisplay = (
          <Table>
            <Table.Header>
              <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Town</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {this.state.queueList.map((user) => {
                return <ConstituentRow key = {user.id} room={this.props.room} name={user.name} town={user.town} user = {user} />; 
              })}
            </Table.Body>
          </Table> 
      )  
    };


    let rightColumn = (
      <div>
        <p> Number of participants in queue: {this.state.queueLength}</p>
        {queueDisplay}
      </div> 
    ); 
  
    
    const controller = (
      <div className="controller-owner">
        <div>
          {/* <Button primary disabled={this.state.queueLength >= 0 } onClick={this.handleKickUser}>
            End current conversation
          </Button> */}
          <Button primary disabled={this.state.queueLength === 0} onClick={this.handleNext}>
            Next Participant
          </Button>
          <Button negative floated="right" onClick={this.handleEnd}>
            End session
          </Button>
          <CopyToClipboard
            text={window.location.href}
            onCopy={() => this.setState({ copied: true })}
          >
            <Button floated="right">
              {this.state.copied ? "Room link copied!" : "Copy room link"}
            </Button>
          </CopyToClipboard>
        </div>
      </div>
    );

    if (this.state.copied) {
      // remove the "Room link copied!" after two seconds
      setTimeout(() => {
        this.setState({
          copied: false,
        });
      }, 2000);
    }

    return (
      <>
        {controller}
        <Divider section
        />
          <div className="ui grid">
              <div class = "thirteen wide column"> 
                {leftColumn}
              </div>
              <div class = "three wide column">
                {rightColumn}
              </div>
            
          </div>
      </>
    );
  }
}

export default HostRoom;
