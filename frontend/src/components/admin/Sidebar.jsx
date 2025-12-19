import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HouseDoorFill,
  PeopleFill,
  FileEarmarkTextFill,
  FileSlides,
  CashStack,
  BoxArrowRight,
  List,
  BellFill,
} from "react-bootstrap-icons";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Button, Nav, OverlayTrigger, Tooltip } from "react-bootstrap";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const toggleSidebar = () => {
    setIsTransitioning(true);
    setIsOpen(!isOpen);
    // Đợi transition kết thúc (300ms) rồi mới cho phép scrollbar xuất hiện lại
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const menuItems = [
    { to: "/admin/notifications", icon: <BellFill />, label: "Thông báo" },
    { to: "/admin/dashboard", icon: <HouseDoorFill />, label: "Dashboard" },
    { to: "/admin/users", icon: <PeopleFill />, label: "Quản lý nhân viên" },
    { to: "/admin/channels", icon: <FileSlides />, label: "Quản lý kênh" },
    { to: "/admin/networks", icon: <CashStack />, label: "Quản lý Network" },
    {
      to: "/admin/kpi_tasks",
      icon: <FileEarmarkTextFill />,
      label: "Quản lý KPI & Công việc",
    },
  ];

  const renderMenuItem = (item) => {
    const navLink = (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `nav-link d-flex align-items-center text-white rounded-3 ${
            isActive ? "bg-primary text-white shadow" : ""
          }`
        }
        style={{
          transition: "all 0.2s",
          justifyContent: isOpen ? "flex-start" : "center",
          padding: isOpen ? "0.5rem 1rem" : "0.5rem",
        }}
      >
        <span className="fs-5" style={{ minWidth: "24px" }}>
          {item.icon}
        </span>
        {isOpen && <span className="ms-3">{item.label}</span>}
      </NavLink>
    );

    // Khi thu gọn, hiển thị tooltip
    if (!isOpen) {
      return (
        <OverlayTrigger
          placement="right"
          overlay={<Tooltip>{item.label}</Tooltip>}
        >
          {navLink}
        </OverlayTrigger>
      );
    }

    return navLink;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="primary"
        className="d-lg-none position-fixed top-0 start-0 m-3"
        style={{ zIndex: 1030 }}
        onClick={toggleMobileMenu}
      >
        <List size={24} />
      </Button>

      {/* Overlay khi mở menu mobile */}
      {isMobileMenuOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1020 }}
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`d-flex flex-column bg-dark text-white vh-100 position-fixed top-0 start-0 d-lg-flex ${
          isMobileMenuOpen ? "" : "d-none"
        }`}
        style={{
          width: isOpen ? "260px" : "80px",
          transition: "width 0.3s ease",
          zIndex: 1040,
          overflow: "hidden", // Thay đổi từ overflowX thành overflow
        }}
      >
        {/* Logo & Toggle Button */}
        <div
          className="d-flex align-items-center border-bottom border-secondary"
          style={{
            padding: "1rem",
            minHeight: "70px",
            justifyContent: isOpen ? "space-between" : "center",
            flexShrink: 0, // Thêm để đảm bảo header không bị co lại
          }}
        >
          {isOpen && <h4 className="mb-0 fw-bold">Admin Panel</h4>}
          <Button
            variant="link"
            className="text-white p-0"
            onClick={toggleSidebar}
            title={isOpen ? "Thu gọn" : "Mở rộng"}
          >
            <List size={28} />
          </Button>
        </div>

        {/* Menu Items */}
        <Nav
          className="flex-column px-3 py-4 flex-grow-1"
          style={{
            overflowY: isTransitioning ? "hidden" : "auto",
            overflowX: "hidden",
          }}
        >
          {menuItems.map((item) => (
            <Nav.Item key={item.to} className="mb-2">
              {renderMenuItem(item)}
            </Nav.Item>
          ))}
        </Nav>

        {/* Logout */}
        <div
          className="border-top border-secondary p-3"
          style={{ flexShrink: 0 }}
        >
          {isOpen ? (
            <Button
              variant="outline-danger"
              className="w-100 d-flex align-items-center justify-content-center"
              onClick={logout}
            >
              <BoxArrowRight className="me-2" size={20} />
              <span>Đăng xuất</span>
            </Button>
          ) : (
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>Đăng xuất</Tooltip>}
            >
              <Button
                variant="outline-danger"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={logout}
              >
                <BoxArrowRight size={20} />
              </Button>
            </OverlayTrigger>
          )}
        </div>
      </div>

      {/* Spacer cho nội dung chính trên desktop */}
      <div
        className="d-none d-lg-block"
        style={{
          width: isOpen ? "260px" : "80px",
          transition: "width 0.3s ease",
          flexShrink: 0,
        }}
      />
    </>
  );
};

export default Sidebar;
