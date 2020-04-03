import React, { Component } from "react";
import { get } from "../../utilities";
import LocalAuth from "./LocalAuth";
import { Button } from "semantic-ui-react";

/**
 * Proptypes
 * @param {(user) => void} setUser: (function) login user
 * @param {(user) => void} logout: (function) logout user
 * @param {boolean} loggedIn: is user loggedIn
 * @param {string[]} providers: providers for oauth
 */

class AuthController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
    };
  }

  login = (user) => {
    this.props.setUser(user);
  };

  logout = () => {
    get("/auth/logout").then(() => {
      this.props.logout();
    });
  };

  render() {
    const { loggedIn, disabled, providers } = this.props;

    return (
      <>
        {loggedIn ? (
          <Button content="Log out" className="auth-logout" onClick={this.logout} />
        ) : (
          <LocalAuth login={this.login} disabled={disabled} />
        )}
      </>
    );
  }
}

export default AuthController;
