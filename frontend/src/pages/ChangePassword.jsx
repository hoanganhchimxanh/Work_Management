// import React, { useState } from "react";
// import { Button, Container, Form, Row, Col, Alert } from "react-bootstrap";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import "../../styles/change-password.style.css";

// function ChangePassword() {
//   return (
//     <div
//       className="cp-bg"
//       style={{ backgroundImage: "url(/images/background.jpg)" }}
//     >
//       <Container className="cp-container">
//         <Row className="justify-content-center">
//           <Col xs={12} md={6}>
//             <h2 className="cp-title">Đổi mật khẩu mới</h2>

//             {error && <Alert variant="danger">{error}</Alert>}
//             {success && <Alert variant="success">{success}</Alert>}

//             <Form onSubmit={handleSubmit}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Mật khẩu mới</Form.Label>
//                 <Form.Control
//                   type="password"
//                   placeholder="Nhập mật khẩu mới"
//                   value={password1}
//                   onChange={(e) => setPassword1(e.target.value)}
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Nhập lại mật khẩu</Form.Label>
//                 <Form.Control
//                   type="password"
//                   placeholder="Nhập lại mật khẩu"
//                   value={password2}
//                   onChange={(e) => setPassword2(e.target.value)}
//                 />
//               </Form.Group>

//               <Button type="submit" className="w-100 cp-btn">
//                 Xác nhận đổi mật khẩu
//               </Button>
//             </Form>
//           </Col>
//         </Row>
//       </Container>
//     </div>
//   );
// }

// export default ChangePassword;
