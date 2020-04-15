import React, { Component } from "react";
import { Router, navigate } from "@reach/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";

import "../utilities.css";
import "../styles.css";
import { socket } from "../client-socket.js";

import NotFound from "./pages/NotFound.js";
import Home from "./pages/Home.js";
import AuthController from "./modules/AuthController";
import RoomContainer from "./pages/RoomContainer";
import ExitPage from "./pages/ExitPage";
import { Divider } from "semantic-ui-react";
import AdminPanel from "./pages/AdminPanel";

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
      socketConnected: false,
    };
    socket.on("connect", () => {
      this.setState({ socketConnected: true });
    });
    socket.on("user", (user) => {
      this.setState({ user });
    });
  }

  componentDidMount() {}

  setUser = (user) => {
    this.setState({ user });
  };

  handleLogout = () => {
    this.setState({ user: undefined });
    navigate("/");
  };

  render() {
    const authController = (
      <AuthController
        logout={this.handleLogout}
        loggedIn={this.state.user !== undefined}
        setUser={this.setUser}
        providers={["google"]}
      />
    );

    return (
      <div className="app-container">
        <header>
          <h1 className="header">
            <FontAwesomeIcon icon={faCommentAlt} className="header-icon" />
            Politichat
          </h1>
          {this.state.user && <div className="header-buttons">{authController}</div>}
        </header>
        <Divider />
        <Router>
          <Home path="/" setUser={this.setUser} logout={this.handleLogout} user={this.state.user} />
          <AdminPanel path="/admin" user={this.state.user} />
          <RoomContainer
            path="/room/:roomId"
            user={this.state.user}
            socketConnected={this.state.socketConnected}
          />
          <ExitPage path="/exit/:reason/:roomId" user={this.state.user} />
          <NotFound default />
        </Router>
        <footer>
          <p className="footer-content">Made by Sabrina and Kye for CS91r</p>
        </footer>
      </div>
    );
  }
}

export default App;
