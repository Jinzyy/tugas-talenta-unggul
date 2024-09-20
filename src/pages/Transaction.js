import React, { useEffect, useState } from "react";
import { Table, message, Button } from "antd";
import axios from "axios";
import LayoutUtama from "../components/Layoututama";
import { Content } from "antd/es/layout/layout";

import { FileAddFilled } from "@ant-design/icons";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    axios
      .get("http://localhost:5000/api/transactions")
      .then((response) => {
        setTransactions(response.data.transactions);
      })
      .catch(() => {
        message.error("Failed to fetch transactions");
      });
  };

  const exportTransactions = (format) => {
    axios
      .get(`http://localhost:5000/api/export_transactions?format=${format}`, {
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          format === "csv" ? "transactions.csv" : "transactions.pdf"
        );
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        message.error(`Failed to export transactions as ${format}`);
      });
  };

  const transactionColumns = [
    { title: "Kode Pesanan", dataIndex: "kode_barang", key: "kode_barang" },
    {
      title: "Tanggal Transaksi",
      dataIndex: "tanggal_transaksi",
      key: "tanggal_transaksi",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    { title: "Nama Barang", dataIndex: "nama_barang", key: "nama_barang" },
    { title: "Jenis Barang", dataIndex: "jenis_barang", key: "jenis_barang" },
    {
      title: "Jumlah Barang",
      dataIndex: "jumlah_barang",
      key: "jumlah_barang",
    },
    {
      title: "Berat",
      dataIndex: "berat",
      key: "berat",
    },
    {
      title: "Harga Barang",
      dataIndex: "harga",
      key: "harga",
    },
    {
      title: "Harga Total",
      dataIndex: "harga_total",
      key: "harga_total",
    },
    {
      title: "Pelanggan",
      dataIndex: "pelanggan",
      key: "pelanggan",
    },
    { title: "Nama Pegawai", dataIndex: "nama_pegawai", key: "nama_pegawai" },
  ];

  return (
    <LayoutUtama>
      <Content style={{ margin: "16px" }}>
        <div>
          <h2>Daftar Transaksi</h2>
          <Button
            icon={<FileAddFilled />}
            onClick={() => exportTransactions("csv")}
            style={{ marginBottom: "20px" }}
            type="primary"
          >
            Export to CSV
          </Button>
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            rowKey="_id"
          />
        </div>
      </Content>
    </LayoutUtama>
  );
};

export default Transactions;
