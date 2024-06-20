import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, Modal, message } from "antd";
import axios from "axios";
import LayoutUtama from "../components/Layoututama";
import { Content } from "antd/es/layout/layout";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    axios
      .get("http://localhost:5000/api/transactions")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setTransactions(response.data);
        } else {
          // Handle kasus jika respons bukan array
          message.error("Invalid data format from server");
        }
      })
      .catch(() => {
        message.error("Failed to fetch transactions");
      });
  };

  const addTransaction = (values) => {
    axios
      .post("http://localhost:5000/api/transactions", values)
      .then(() => {
        fetchTransactions();
        message.success("Transaction added successfully");
      })
      .catch(() => {
        message.error("Failed to add transaction");
      });
  };

  const updateTransaction = (values) => {
    axios
      .put(
        `http://localhost:5000/api/transactions/${editingTransaction._id}`,
        values
      )
      .then(() => {
        fetchTransactions();
        setIsModalVisible(false);
        message.success("Transaction updated successfully");
      })
      .catch(() => {
        message.error("Failed to update transaction");
      });
  };

  const deleteTransaction = (id) => {
    axios
      .delete(`http://localhost:5000/api/transactions/${id}`)
      .then(() => {
        fetchTransactions();
        message.success("Transaction deleted successfully");
      })
      .catch(() => {
        message.error("Failed to delete transaction");
      });
  };

  const showEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalVisible(true);
  };

  const handleModalOk = (values) => {
    if (editingTransaction) {
      updateTransaction(values);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTransaction(null);
  };

  const transactionColumns = [
    { title: "Nama Barang", dataIndex: "nama_barang", key: "nama_barang" },
    { title: "Jumlah", dataIndex: "jumlah", key: "jumlah" },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <span>
          <Button onClick={() => showEditModal(record)}>Edit</Button>
          <Button onClick={() => deleteTransaction(record._id)}>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <LayoutUtama>
      <Content style={{ margin: "16px" }}>
        <div>
          <h2>Daftar Transaksi</h2>
          <Form onFinish={addTransaction}>
            <Form.Item
              name="nama_barang"
              rules={[
                { required: true, message: "Please input the item name!" },
              ]}
            >
              <Input placeholder="Nama Barang" />
            </Form.Item>
            <Form.Item
              name="jumlah"
              rules={[
                { required: true, message: "Please input the quantity!" },
              ]}
            >
              <Input placeholder="Jumlah" />
            </Form.Item>
            <Form.Item
              name="tanggal"
              rules={[{ required: true, message: "Please input the date!" }]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add Transaction
              </Button>
            </Form.Item>
          </Form>
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            rowKey="_id"
          />
          <Modal
            title="Edit Transaction"
            visible={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Form initialValues={editingTransaction} onFinish={handleModalOk}>
              <Form.Item
                name="nama_barang"
                rules={[
                  { required: true, message: "Please input the item name!" },
                ]}
              >
                <Input placeholder="Nama Barang" />
              </Form.Item>
              <Form.Item
                name="jumlah"
                rules={[
                  { required: true, message: "Please input the quantity!" },
                ]}
              >
                <Input placeholder="Jumlah" />
              </Form.Item>
              <Form.Item
                name="tanggal"
                rules={[{ required: true, message: "Please input the date!" }]}
              >
                <Input type="date" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Transaction
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </LayoutUtama>
  );
};

export default Transactions;
