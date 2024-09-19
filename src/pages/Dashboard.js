import React, { useEffect, useState } from "react";
import { Layout, Table } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LayoutUtama from "../components/Layoututama";

const { Content } = Layout;

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/home") // Sesuaikan dengan URL backend Anda
      .then((response) => {
        setInventory(response.data.inventory_summary);
        setEmployees(response.data.employee_summary);
      })
      .catch(() => {
        navigate("/");
      });
  }, [navigate]);

  const inventoryColumns = [
    { title: "Nama", dataIndex: "nama_barang", key: "nama_barang" },
    { title: "Jenis", dataIndex: "jenis_barang", key: "jenis_barang" },
    { title: "Harga", dataIndex: "harga_barang", key: "harga_barang" },
    { title: "Stok", dataIndex: "stok_barang", key: "stok_barang" },
  ];

  const employeeColumns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Tempat Lahir", dataIndex: "tempatLahir", key: "tempatLahir" },
    {
      title: "Tanggal Lahir",
      dataIndex: "tanggalLahir",
      key: "tanggalLahir",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Jenis Kelamin",
      dataIndex: "jenisKelamin",
      key: "jenisKelamin",
    },
    { title: "Alamat", dataIndex: "alamat", key: "alamat" },
  ];

  return (
    <LayoutUtama>
      <Content style={{ margin: "16px" }}>
        <div className="site-layout-background" style={{ minHeight: 360 }}>
          <h2>Daftar Barang</h2>
          <Table
            columns={inventoryColumns}
            dataSource={inventory}
            rowKey="_id"
            pagination={{ pageSize: 5 }} // Set pagination untuk menampilkan 5 item per halaman
          />
          <h2>Daftar Pegawai</h2>
          <Table
            columns={employeeColumns}
            dataSource={employees}
            rowKey="_id"
            pagination={{ pageSize: 5 }} // Set pagination untuk menampilkan 5 item per halaman
          />
        </div>
      </Content>
    </LayoutUtama>
  );
};

export default Dashboard;
