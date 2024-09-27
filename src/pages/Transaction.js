import React, { useEffect, useState } from "react";
import { Table, message, Button, DatePicker, Upload } from "antd";
import axios from "axios";
import LayoutUtama from "../components/Layoututama";
import { Content } from "antd/es/layout/layout";
import { FileAddFilled, ImportOutlined } from "@ant-design/icons";
import moment from "moment";

import config from "../config";

const { RangePicker } = DatePicker;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  const fetchTransactions = () => {
    const params = {};
    if (dateRange[0] && dateRange[1]) {
      params.start_date = dateRange[0].format("YYYY-MM-DD");
      params.end_date = dateRange[1].format("YYYY-MM-DD");
    }

    axios
      .get(`${config.API_BASE_URL}/api/transactions`, { params })
      .then((response) => {
        setTransactions(response.data.transactions);
      })
      .catch(() => {
        message.error("Failed to fetch transactions");
      });
  };

  const exportTransactions = (format) => {
    const params = {};
    if (dateRange[0] && dateRange[1]) {
      params.start_date = dateRange[0].format("YYYY-MM-DD");
      params.end_date = dateRange[1].format("YYYY-MM-DD");
    }

    axios
      .get(`${config.API_BASE_URL}/api/export_transactions?format=${format}`, {
        params,
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          format === "csv"
            ? `transaction_${moment().format("YYYY-MM-DD")}.csv`
            : `transaction_${moment().format("YYYY-MM-DD")}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        message.error(`Failed to export transactions as ${format}`);
      });
  };

  const importTransactions = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post(`${config.API_BASE_URL}/api/import_transactions`, formData)
      .then((response) => {
        if (response.data.success) {
          message.success(response.data.message);
          fetchTransactions(); // Refresh the table after import
        } else {
          message.error(response.data.message);
        }
      })
      .catch(() => {
        message.error("Failed to import transactions");
      });

    return false; // Prevent default upload behavior
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
          <RangePicker
            onChange={setDateRange}
            style={{ marginBottom: "20px" }}
          />
          <Button
            icon={<FileAddFilled />}
            onClick={() => exportTransactions("excel")}
            style={{ marginBottom: "20px", marginLeft: "10px" }}
            type="primary"
          >
            Export to Excel
          </Button>
          <Button
            icon={<FileAddFilled />}
            onClick={() => exportTransactions("csv")}
            style={{
              marginBottom: "20px",
              marginLeft: "10px",
              marginRight: "10px",
            }}
            type="primary"
          >
            Export to CSV
          </Button>
          <Upload
            beforeUpload={importTransactions}
            showUploadList={false}
            icon={<ImportOutlined />}
          >
            <Button type="primary">Import from CSV</Button>
          </Upload>

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
