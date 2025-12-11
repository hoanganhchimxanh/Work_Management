import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

function NetworkModal() {
  return (
    <Modal>
      <Modal.Header closeButton>
        <Modal.Title>Thông tin Network</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Việc làm {/* Employment */}</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Nhắc nhở {/* Reminder */}</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Hồ sơ Adsense {/* Profile Adsense */}</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Địa điểm {/* Location */}</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Tên thuế {/* Tax Name */}</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Địa chỉ Email {/* Email Address */}</Form.Label>
            <Form.Control type="email" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Email khôi phục {/* Recovery Email */}</Form.Label>
            <Form.Control type="email" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Ngày tạo {/* Creation Date */}</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Kênh liên kết {/* Linked Channel */}</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Quốc gia {/* Country */}</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Ngày tham gia {/* Join Date */}</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Form>

        <Form>
          <Form.Group>
            <Form.Label>Email của kênh {/* Email Channel */}</Form.Label>
            <Form.Control type="email" />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary">Hủy</Button>
        <Button variant="primary">Lưu thay đổi</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default NetworkModal;
