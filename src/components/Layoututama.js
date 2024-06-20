import React from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import HeaderComponent from "./Header";

const { Content } = Layout;

const LayoutUtama = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100%" }}>
      <HeaderComponent />
      <Layout>
        <Sidebar />
        <Layout>
          <Content style={{ margin: "16px", padding: "20" }}>
            <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default LayoutUtama;
