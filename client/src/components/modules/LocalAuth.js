import React, { Component } from "react";
import { post } from "../../utilities.js";
import { Button, Input, Form } from "semantic-ui-react";

class LocalAuth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      passwordConfirm: "",
      isRegistering: false,
      errorMessage: "",
    };
  }

  componentDidMount() {}

  handleChange = (evt) => {
    this.setState({ [evt.target.name]: evt.target.value });
  };

  attemptLogin = () => {
    const { username, password } = this.state;
    if (username === "" || password === "") {
      this.setState({ errorMessage: "Must have non-empty usename/password" });
    } else {
      post("/auth/login", { username, password })
        .then((user) => {
          this.props.login(user);
        })
        .catch((error) => {
          if (error.status === 401) {
            this.setState({ errorMessage: "Incorrect username or password" });
          }
        });
    }
  };

  attemptRegister = () => {
    const { username, password, passwordConfirm } = this.state;
    if (password != passwordConfirm) {
      this.setState({ errorMessage: "Passwords don't match" });
    } else if (username === "" || password === "") {
      this.setState({ errorMessage: "Cannot have an empty username or password!" });
    } else {
      post("/auth/register", { username, password })
        .then((user) => {
          this.props.login(user);
        })
        .catch((error) => {
          if (error.status === 403) {
            this.setState({ errorMessage: "Username already exists" });
          }
        });
    }
  };

  toggleRegistrationStatus = () => {
    this.setState({ isRegistering: !this.state.isRegistering });
  };

  render() {
    return (
      <Form className="auth-container">
        <Input
          className="login-input"
          onChange={this.handleChange}
          name="username"
          placeholder="Username"
        />
        <Input
          className="login-input"
          onChange={this.handleChange}
          type="password"
          name="password"
          placeholder="Password"
        />
        {this.state.isRegistering ? (
          <>
            <Input
              className="login-input"
              onChange={this.handleChange}
              type="password"
              name="passwordConfirm"
              placeholder="Confirm password"
            />
            <div className="auth-buttons">
              <Button content="Register" onClick={this.attemptRegister} />
              <Button content="Have an account?" onClick={this.toggleRegistrationStatus} />
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Button content="Log in" className="login-button" onClick={this.attemptLogin} />
            <Button
              content="Register"
              className="login-button"
              onClick={this.toggleRegistrationStatus}
            />
          </div>
        )}
        <div>{this.state.errorMessage}</div>
      </Form>
    );
  }
}

export default LocalAuth;
