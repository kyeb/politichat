import React, { Component } from "react";
import { Form, Message } from "semantic-ui-react";
import { post } from "../../utilities";
import { navigate } from "@reach/router";

class CreateRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newRoomName: "",
            newRoomLink: "",
            newRoomWaiting: "",
            newRoomExit: "",
            newRoomPrivate: true
        };
    } 

    componentDidMount() {}

    handleNewRoom = () => {
        post("/api/newroom", { roomName: this.state.newRoomName, roomLink: this.state.newRoomLink, 
            waitingMessage: this.state.newRoomWaiting, exitMessage: this.state.newRoomExit, isPrivate: this.state.newRoomPrivate })
          .then((room) => {
            navigate(`/room/${room.id}`);
          })
          .catch((err) => {
            alert(
              "Something went wrong! Try a different name or reloading.\n\nTip: room names cannot contain special characters, and make sure the URL is valid."
            );
          });
      };

    render() {
        let newRoomForm;
        newRoomForm = (
            <div className="newroom-container">
            <h2>Create a new room</h2>
                <Form>
                    <Form.Input
                    className="newroom-name"
                    placeholder="Room name"
                    onChange={(event) => this.setState({ newRoomName: event.target.value })}
                    value={this.state.newRoomName}
                    width={5}
                    />
                    <Form.Input
                    className="newroom-link"
                    placeholder="Room link"
                    onChange={(event) => this.setState({ newRoomLink: event.target.value })}
                    value={this.state.newRoomLink}
                    width={5}
                    />
                    <Form.TextArea
                    label="Waiting room message"
                    placeholder="This is what people will see while waiting to chat with you!"
                    onChange={(event) => this.setState({ newRoomWaiting: event.target.value })}
                    value={this.state.newRoomWaiting}
                    />
                    <Form.TextArea
                    label="Exit room message"
                    placeholder="This is what people will see after chatting with you!"
                    onChange={(event) => this.setState({ newRoomExit: event.target.value })}
                    value={this.state.newRoomExit}
                    />
                    <Form.Checkbox
                    checked={this.state.newRoomPrivate}
                    label={<label>Private</label>}
                    onChange={(event) => this.setState((prevState) => ({ newRoomPrivate: !prevState.newRoomPrivate }))}
                    />
                    <Form.Button primary className="newroom-button" onClick={this.handleNewRoom}>
                    Create room
                    </Form.Button>
                </Form> 
            </div>
        );
        return <>{newRoomForm}</>;
    };
    // } else {
    //   newRoomForm = (
    //     <Message negative>
    //       You do not have permissions to create new rooms yet. <br /> Please email us at{" "}
    //       <a href="mailto:politichat@mit.edu?subject=Politichat Beta access request">
    //         politichat@mit.edu
    //       </a>{" "}
    //       for information on how to gain access to our beta.
    //     </Message>
    //   );
    // }
};

export default CreateRoom;
