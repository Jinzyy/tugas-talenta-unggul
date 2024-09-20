import React, { useEffect, useState } from "react";
import { Layout, Table, DatePicker, Button } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LayoutUtama from "../components/Layoututama";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Content } = Layout;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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

  const fetchTransactions = () => {
    if (startDate && endDate) {
      axios
        .get("http://localhost:5000/api/transactions_by_date", {
          params: {
            start_date: startDate.format("YYYY-MM-DD"),
            end_date: endDate.format("YYYY-MM-DD"),
          },
        })
        .then((response) => {
          // Format transaksi yang diterima dari backend
          const formattedTransactions = response.data.transactions.map(
            (trans) => ({
              tanggal_transaksi: trans._id,
              total_pendapatan: trans.total_pendapatan,
            })
          );
          setTransactions(formattedTransactions);
        })
        .catch((error) => {
          console.error("Error fetching transactions", error);
        });
    }
  };

  const onDateRangeChange = (dates) => {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

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
          <h2>Grafik Pendapatan Harian</h2>
          <RangePicker onChange={onDateRangeChange} />
          <Button
            type="primary"
            onClick={fetchTransactions}
            style={{ marginLeft: "8px" }}
          >
            Tampilkan Grafik
          </Button>
          {transactions.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={transactions}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tanggal_transaksi" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_pendapatan"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
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
