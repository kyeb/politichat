import React, { Component } from "react";
import { Router, Match, navigate } from "@reach/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";
import { Divider, Button } from "semantic-ui-react";

import "../utilities.css";
import "../styles.css";
import { socket } from "../client-socket.js";

import NotFound from "./pages/NotFound.js";
import Home from "./pages/Home.js";
import CreateRoom from "./pages/CreateRoom.js";
import AuthController from "./modules/AuthController";
import RoomContainer from "./pages/RoomContainer";
import ExitPage from "./pages/ExitPage";
import AdminPanel from "./pages/AdminPanel";
import HomepageLayout from "./pages/NewHomepage";

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

    const header = (
      <>
        <header>
          <h1 className="header">
            <FontAwesomeIcon icon={faCommentAlt} className="header-icon" />
            Politichat
          </h1>
          {this.state.user && (
            <div className="header-buttons">
              {this.state.user.admin && (
                <Match path="/admin">
                  {(props) =>
                    props.match ? (
                      <Button className="header-admin" onClick={() => navigate("/dashboard")}>
                        Home
                      </Button>
                    ) : (
                      <Button className="header-admin" onClick={() => navigate("/admin")}>
                        Admin panel
                      </Button>
                    )
                  }
                </Match>
              )}
              {authController}
            </div>
          )}
        </header>
        <Divider />
      </>
    );

    const footer = (
      <footer>
        <p className="footer-content">Made by Sabrina, Kye, and Daniel for CS91r</p>
      </footer>
    );

    const app = (
      <Router>
        <Home
          path="/dashboard"
          setUser={this.setUser}
          logout={this.handleLogout}
          user={this.state.user}
          socketConnected={this.state.socketConnected}
        />
        <CreateRoom path="/create" user={this.state.user} />
        <AdminPanel path="/admin" user={this.state.user} />
        <RoomContainer
          path="/room/:roomId"
          user={this.state.user}
          socketConnected={this.state.socketConnected}
        />
        <ExitPage path="/exit/:reason/:roomId" user={this.state.user} />
        <HomepageLayout path="/" />
        <NotFound default />
      </Router>
    );

    // on homepage, don't render app container or header
    return (
      <Match path="/">
        {(props) =>
          props.match ? (
            <>{app}</>
          ) : (
            <>
              <div className="app-container">
                {header} {app} {footer}
              </div>
            </>
          )
        }
      </Match>
    );
  }
}

export default App;
