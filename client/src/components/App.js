import React, { Component } from "react";
import { Router } from "@reach/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";

import "../utilities.css";
import "../styles.css";
import { socket } from "../client-socket.js";

import NotFound from "./pages/NotFound.js";
import Home from "./pages/Home.js";
import AuthController from "./modules/AuthController";

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
    };
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
        <Router>
          <Home path="/" setUser={this.setUser} logout={this.handleLogout} user={this.state.user} />
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
