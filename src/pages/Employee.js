import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, Modal, Select, message } from "antd";
import axios from "axios";
import LayoutUtama from "../components/Layoututama";
import { Content } from "antd/es/layout/layout";
import { EditFilled, DeleteFilled, SearchOutlined } from "@ant-design/icons";

import config from "../config";

const { Option } = Select;

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, pagination.current]);

  const fetchEmployees = () => {
    axios
      .get(`${config.API_BASE_URL}/api/pegawai`)
      .then((response) => {
        const filteredData = response.data.pegawai.filter((employee) =>
          employee.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setEmployees(filteredData);
      })
      .catch(() => {
        message.error("Failed to fetch employees");
      });
  };

  const addEmployee = (values) => {
    axios
      .post(`${config.API_BASE_URL}/api/pegawai`, values)
      .then(() => {
        fetchEmployees();
        form.resetFields();
        message.success("Employee added successfully");
      })
      .catch(() => {
        message.error("Failed to add employee");
      });
  };

  const updateEmployee = (values) => {
    axios
      .put(`${config.API_BASE_URL}/api/pegawai/${editingEmployee._id}`, values)
      .then(() => {
        fetchEmployees();
        setIsModalVisible(false);
        message.success("Employee updated successfully");
      })
      .catch(() => {
        message.error("Failed to update employee");
      });
  };

  const deleteEmployee = (id) => {
    axios
      .delete(`${config.API_BASE_URL}/api/pegawai/${id}`)
      .then(() => {
        fetchEmployees();
        message.success("Berhasil menghapus pegawai");
      })
      .catch(() => {
        message.error("Gagal menghapus pegawai");
      });
  };

  const showEditModal = (employee) => {
    setEditingEmployee(employee);
    setIsModalVisible(true);
  };

  const handleModalOk = (values) => {
    if (editingEmployee) {
      updateEmployee(values);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingEmployee(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

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
            onClick={() => deleteEmployee(record._id)}
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
          <h2>Daftar Pegawai</h2>
          <Form form={form} onFinish={addEmployee}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Mohon masukkan username!" }]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="tempat_lahir"
              rules={[
                { required: true, message: "Mohon masukkan tempat kelahiran!" },
              ]}
            >
              <Input placeholder="Tempat Lahir" />
            </Form.Item>
            <Form.Item
              name="tanggal_lahir"
              rules={[
                { required: true, message: "Mohon masukkan tanggal lahir!" },
              ]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="jenis_kelamin"
              rules={[
                { required: true, message: "Mohon pilih jenis kelamin!" },
              ]}
            >
              <Select placeholder="Jenis Kelamin">
                <Option value="Laki-laki">Laki-laki</Option>
                <Option value="Perempuan">Perempuan</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="alamat"
              rules={[{ required: true, message: "Mohon masukkan alamat!" }]}
            >
              <Input placeholder="Alamat" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Mohon masukkan password!" }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item
              name="role"
              rules={[
                { required: true, message: "Mohon pilih otoritas akun!" },
              ]}
            >
              <Select placeholder="Role">
                <Option value="admin">Admin</Option>
                <Option value="pegawai">Pegawai</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Tambah Pegawai
              </Button>
            </Form.Item>
          </Form>

          {/* Input untuk pencarian pegawai secara real-time */}
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <Input
              placeholder="Cari Pegawai"
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
          </div>

          {/* Table with pagination */}
          <Table
            columns={employeeColumns}
            dataSource={employees}
            rowKey="_id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: employees.length,
              onChange: (page) =>
                setPagination({ ...pagination, current: page }),
            }}
            onChange={handleTableChange}
          />

          {/* Modal for editing employee */}
          <Modal
            title="Edit Pegawai"
            visible={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Form initialValues={editingEmployee} onFinish={handleModalOk}>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Mohon masukkan username!" },
                ]}
              >
                <Input placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="tempatLahir"
                rules={[
                  {
                    required: true,
                    message: "Mohon masukkan tempat kelahiran!",
                  },
                ]}
              >
                <Input placeholder="Tempat Lahir" />
              </Form.Item>
              <Form.Item
                name="tanggalLahir"
                rules={[
                  {
                    required: true,
                    message: "Mohon masukkan tanggal lahir!",
                  },
                ]}
              >
                <Input type="date" />
              </Form.Item>
              <Form.Item
                name="jenisKelamin"
                rules={[
                  { required: true, message: "Mohon pilih jenis kelamin!" },
                ]}
              >
                <Select placeholder="Jenis Kelamin">
                  <Option value="Laki-laki">Laki-laki</Option>
                  <Option value="Perempuan">Perempuan</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="alamat"
                rules={[{ required: true, message: "Mohon masukkan alamat!" }]}
              >
                <Input placeholder="Alamat" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Pegawai
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </LayoutUtama>
  );
};

export default Employee;
