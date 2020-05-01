import React, { Component } from "react";
import { Table } from "semantic-ui-react";

class ParticipantList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let makeTableHeader = (headings) => (
      <Table.Row>
        {headings.map((header, index) => <Table.HeaderCell key={index}>{header}</Table.HeaderCell>)}
      </Table.Row>
    );

    let createRow = (info, index) => {
      return (
        <Table.Row key={index}>
          {["name", "email", "phone", "town"].map((prop, ind) => (
            <Table.Cell key={ind}>
              {info[prop]}
            </Table.Cell>
          ))}
        </Table.Row>
      );
    }

    return (
      <>
        <h3>Participant information</h3>
        <Table celled columns={4}>
          <Table.Header>
            {makeTableHeader(["Name", "Email Address", "Phone Number", "Town"])}
          </Table.Header>
          <Table.Body>
            {this.props.infos.map((info, index) => createRow(info, index))}
          </Table.Body>
        </Table>
      </>
    );
  }
}

export default ParticipantList;
