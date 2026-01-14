import React from "react";
import { Table, Badge } from "react-bootstrap";

function EmployeeTable({ employees = [] }) {
  return (
    <Table bordered hover responsive size="sm">
      <thead className="table-light">
        <tr>
          <th>STT</th>
          <th>Tên nhân sự</th>
          <th>SĐT</th>
          <th>Ngày sinh</th>
          <th>Facebook</th>
          <th>Ngày vào làm</th>
          <th>STK</th>
          <th>Ngân hàng</th>
          <th>Department</th>
          <th>Note</th>
        </tr>
      </thead>

      <tbody>
        {employees.length === 0 ? (
          <tr>
            <td colSpan={10} className="text-center text-muted">
              No employees found
            </td>
          </tr>
        ) : (
          employees.map((emp, index) => (
            <tr key={emp._id || index}>
              <td>{index + 1}</td>

              {/* User (populate từ User model) */}
              <td>{emp.user?.email || emp.user?.username || emp.user?._id}</td>

              <td>{emp.phoneNumber || "-"}</td>

              <td>
                {emp.birthday
                  ? new Date(emp.birthday).toLocaleDateString()
                  : "-"}
              </td>

              <td>
                {emp.facebookUrl ? (
                  <a href={emp.facebookUrl} target="_blank" rel="noreferrer">
                    Link
                  </a>
                ) : (
                  "-"
                )}
              </td>

              <td>{new Date(emp.joinDate).toLocaleDateString()}</td>

              <td>
                <Badge bg="secondary">{emp.department}</Badge>
              </td>

              <td>{emp.bankAccount?.bankName || "-"}</td>

              <td>{emp.bankAccount?.accountNumber || "-"}</td>

              <td className="text-truncate" style={{ maxWidth: 150 }}>
                {emp.note || "-"}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}

export default EmployeeTable;
