import React from "react";
import { Container, Table } from "react-bootstrap";

function networkTable() {
  return (
    <Container fluid>
      <h1>Quản lý Network</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Employment</th>
            <th>Reminder</th>
            <th>Profile Adsense</th>
            <th>Location</th>
            <th>Tax Name</th>
            <th>Email Address</th>
            <th>Recovery Email</th>
            <th>Creation Date</th>
            <th>Linked Channel</th>
            <th>Country</th>
            <th>Join Date</th>
            <th>Email Channel</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
            <td>Otto</td>
            <td>@mdo</td>
            <td>Otto</td>
            <td>@mdo</td>
            <td>Otto</td>
            <td>@mdo</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default networkTable;
