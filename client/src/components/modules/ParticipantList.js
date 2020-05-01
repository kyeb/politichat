import React, { Component } from "react";
import { Table } from "semantic-ui-react";
import { CSVLink, CSVDownload } from "react-csv";

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

    let orderedProps = ["name", "email", "phone", "town"];
    let orderedHeaders = ["Name", "Email Address", "Phone Number", "Town"];

    let createRow = (info, index) => {
      return (
        <Table.Row key={index}>
          {orderedProps.map((prop, ind) => (
            <Table.Cell key={ind}>
              {info[prop]}
            </Table.Cell>
          ))}
        </Table.Row>
      );
    }

    let csvData = this.props.infos.map((info) => {
      return orderedProps.map((prop) => info[prop]);
    });
    csvData.unshift(orderedHeaders);

    return (
      <>
        <h3>Participant information</h3>

        Download information as a
        <CSVLink data={csvData} filename={this.props.roomId + "_participantinfo.csv"}> csv file</CSVLink>

        <Table celled columns={4}>
          <Table.Header>
            {makeTableHeader(orderedHeaders)}
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
