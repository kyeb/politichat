import React, { Component } from "react";
import { navigate } from "@reach/router";
import { Button, Loader, Message, Divider, Table } from "semantic-ui-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import VideoChat from "../modules/VideoChat";
import { post, error } from "../../utilities";
import { socket } from "../../client-socket.js";

class HostRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queueList: [], 
      queueLength: this.props.room ? this.props.room.queue.length : 0,
      copied: false,
    };
    socket.on("queue status", (queueLength) => {
      this.setState({ queueLength });
    });
    socket.on("queue array", (queueList) => {
      this.setState({ queueList }); 
    })
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
          navigate(`/exit/host/${this.props.room.id}`);
        } else {
          error(res, "did not delete from array");
        }
      })
      .catch((err) => {
        error(err, "POST to /api/end failed.");
      });
  };

  handleTable = () => {
    let table = [];

    table.push(
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Town</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
       </Table.Header>);

    // Outer loop to create parent
    for (let i = 0; i < this.state.queueList.length; i++) {
      let children = [];

      // Inner loop to create children
      for (let j = 0; j < 3; j++) {
        if (j === 0){
          children.push(<Table.Cell textAlign = "left">{i + 1}. {this.state.queueList[i].name} </Table.Cell>);
        }
        else if (j === 1) {
          children.push(<Table.Cell textAlign = "left">{this.state.queueList[i].town}</Table.Cell>);
        }
        else {
          children.push(<Button primary size = "mini" floated="right">Add participant</Button>);
        }
      }

      // Create the parent and add the children
      table.push(<Table.Row children={children}></Table.Row>)
    }
    return table
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
    if(this.state.queueList.length === 0){
      queueDisplay= (
        <div>
        <p> Number of participants in queue: {this.state.queueLength}</p>
        </div> 
      );
    }
    else { 
      queueDisplay = (
        <div> 
          <p> Number of participants in queue: {this.state.queueLength}</p>
          <table>
            {this.handleTable()}
          </table>
        </div>
      )  
    };


    let rightColumn = (
      <div>
        {queueDisplay}
      </div> 
    ); 
  
    
    const controller = (
      <div className="controller-owner">
        <div>
          <Button primary disabled={this.state.queueLength === 0} onClick={this.handleNext}>
            End current conversation
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
