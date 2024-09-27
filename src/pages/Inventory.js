import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, Modal, message } from "antd";
import axios from "axios";
import LayoutUtama from "../components/Layoututama";
import { Content } from "antd/es/layout/layout";
import { EditFilled, DeleteFilled, SearchOutlined } from "@ant-design/icons";

import config from "../config";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = () => {
    axios
      .get(`${config.API_BASE_URL}/api/inventory`)
      .then((response) => {
        setInventory(response.data.inventory_summary);
        setFilteredInventory(response.data.inventory_summary);
      })
      .catch((error) => {
        console.error("Error fetching inventory:", error);
      });
  };

  const addInventory = (values) => {
    axios
      .post(`${config.API_BASE_URL}/api/inventory`, values)
      .then(() => {
        fetchInventory();
        form.resetFields();
        message.success("Berhasil menambah item");
      })
      .catch(() => {
        message.error("Gagal menambah item");
      });
  };

  const updateInventory = (values) => {
    axios
      .put(`${config.API_BASE_URL}/api/inventory/${editingItem._id}`, values)
      .then(() => {
        fetchInventory();
        setIsModalVisible(false);
        message.success("Item berhasil di update");
      })
      .catch(() => {
        message.error("Item gagal di update");
      });
  };

  const deleteInventory = (id) => {
    axios
      .delete(`${config.API_BASE_URL}/api/inventory/${id}`)
      .then(() => {
        fetchInventory();
        message.success("Item berhasil dihapus");
      })
      .catch(() => {
        message.error("Item gagal dihapus");
      });
  };

  const showEditModal = (item) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  const handleModalOk = (values) => {
    if (editingItem) {
      updateInventory(values);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingItem(null);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filteredData = inventory.filter((item) =>
      item.nama_barang.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredInventory(filteredData);
  };

  const inventoryColumns = [
    { title: "Nama", dataIndex: "nama_barang", key: "nama_barang" },
    { title: "Jenis", dataIndex: "jenis_barang", key: "jenis_barang" },
    { title: "Harga", dataIndex: "harga_barang", key: "harga_barang" },
    { title: "Stok", dataIndex: "stok_barang", key: "stok_barang" },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <span>
          <Button
            type="primary"
            onClick={() => showEditModal(record)}
            icon={<EditFilled />}
            style={{ marginRight: "8px" }}
          ></Button>
          <Button
            type="primary"
            danger
            onClick={() => deleteInventory(record._id)}
            icon={<DeleteFilled />}
          ></Button>
        </span>
      ),
    },
  ];

  return (
    <LayoutUtama>
      <Content style={{ margin: "16px" }}>
        <div>
          <h2>Daftar Barang</h2>
          <Form form={form} onFinish={addInventory}>
            <Form.Item
              name="nama_barang"
              rules={[{ required: true, message: "Please input the name!" }]}
            >
              <Input placeholder="Nama Barang" />
            </Form.Item>
            <Form.Item
              name="jenis_barang"
              rules={[{ required: true, message: "Please input the type!" }]}
            >
              <Input placeholder="Jenis Barang" />
            </Form.Item>
            <Form.Item
              name="harga_barang"
              rules={[{ required: true, message: "Please input the price!" }]}
            >
              <Input placeholder="Harga Barang" />
            </Form.Item>
            <Form.Item
              name="stok_barang"
              rules={[{ required: true, message: "Please input the stock!" }]}
            >
              <Input placeholder="Stok Barang" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add Item
              </Button>
            </Form.Item>
          </Form>

          {/* Search Input */}
          <Input
            placeholder="Search Nama Barang"
            style={{ width: 200, marginBottom: "16px", float: "right" }}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            prefix={<SearchOutlined />}
          />

          <Table
            columns={inventoryColumns}
            dataSource={filteredInventory}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />

          <Modal
            title="Edit Item"
            visible={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Form initialValues={editingItem} onFinish={handleModalOk}>
              <Form.Item
                name="nama_barang"
                rules={[{ required: true, message: "Please input the name!" }]}
              >
                <Input placeholder="Nama Barang" />
              </Form.Item>
              <Form.Item
                name="jenis_barang"
                rules={[{ required: true, message: "Please input the type!" }]}
              >
                <Input placeholder="Jenis Barang" />
              </Form.Item>
              <Form.Item
                name="harga_barang"
                rules={[{ required: true, message: "Please input the price!" }]}
              >
                <Input placeholder="Harga Barang" />
              </Form.Item>
              <Form.Item
                name="stok_barang"
                rules={[{ required: true, message: "Please input the stock!" }]}
              >
                <Input placeholder="Stok Barang" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Item
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </LayoutUtama>
  );
};

export default Inventory;
