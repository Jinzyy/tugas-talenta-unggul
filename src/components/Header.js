import React from "react";
import { Layout, Button } from "antd";
import { LogoutOutlined, DingdingOutlined } from "@ant-design/icons";

const { Header } = Layout;

const HeaderComponent = () => {
  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <Header className="header" style={headerStyle}>
      <div className="logo" style={logoStyle}>
        <span>
          <DingdingOutlined />
        </span>
        <span
          style={{ color: "#001529", fontSize: "20px", fontWeight: "bold" }}
        >
          Toko Bawang CV Berkat
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
  backgroundColor: "#ffffff", // Change background color to white
  borderBottom: "1px solid #001529", // Add bottom border
  boxSizing: "border-box",
  height: "64px", // Standard height for Ant Design header
};

const logoStyle = {
  color: "#001529", // Change text color to match the original background color
  fontSize: "20px",
  fontWeight: "bold",
};

const logoutContainerStyle = {
  display: "flex",
  alignItems: "center",
};

export default HeaderComponent;
