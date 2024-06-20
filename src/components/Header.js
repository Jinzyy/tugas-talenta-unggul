import React from "react";
import { Layout, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

const { Header } = Layout;

const HeaderComponent = () => {
  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <Header className="header" style={headerStyle}>
      <div className="logo" style={logoStyle}>
        <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
          CV Bawang Berkat
        </span>
      </div>
      <div style={logoutContainerStyle}>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </Header>
  );
};

// CSS in JS style objects
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 20px",
  backgroundColor: "#001529", // Adjust background color as needed
};

const logoStyle = {
  color: "white",
  fontSize: "20px",
  fontWeight: "bold",
};

const logoutContainerStyle = {
  display: "auto",
  alignItems: "center",
};

export default HeaderComponent;
