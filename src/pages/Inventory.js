import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, Modal, message } from "antd";
import axios from "axios";
import LayoutUtama from "../components/Layoututama";
import { Content } from "antd/es/layout/layout";
import { EditFilled, DeleteFilled } from "@ant-design/icons";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = () => {
    axios
      .get("http://localhost:5000/api/inventory")
      .then((response) => {
        setInventory(response.data.inventory_summary);
      })
      .catch((error) => {
        console.error("Error fetching inventory:", error);
      });
  };

  const addInventory = (values) => {
    axios
      .post("http://localhost:5000/api/inventory", values)
      .then(() => {
        fetchInventory();
        message.success("Item added successfully");
      })
      .catch(() => {
        message.error("Failed to add item");
      });
  };

  const updateInventory = (values) => {
    axios
      .put(`http://localhost:5000/api/inventory/${editingItem._id}`, values)
      .then(() => {
        fetchInventory();
        setIsModalVisible(false);
        message.success("Item updated successfully");
      })
      .catch(() => {
        message.error("Failed to update item");
      });
  };

  const deleteInventory = (id) => {
    axios
      .delete(`http://localhost:5000/api/inventory/${id}`)
      .then(() => {
        fetchInventory();
        message.success("Item deleted successfully");
      })
      .catch(() => {
        message.error("Failed to delete item");
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
          <Form onFinish={addInventory}>
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
          <Table
            columns={inventoryColumns}
            dataSource={inventory}
            rowKey="_id"
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
