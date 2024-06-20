import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  TransactionOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = () => {
  return (
    <Sider width={200} className="site-layout-background">
      <Menu mode="inline" style={{ height: "100%", borderRight: 0 }}>
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to="/home">Beranda</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />}>
          <Link to="/employee">Pegawai</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<ShoppingOutlined />}>
          <Link to="/inventory">Daftar Barang</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<TransactionOutlined />}>
          <Link to="/transaction">Daftar Transaksi</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
