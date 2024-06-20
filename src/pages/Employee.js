import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, Modal, Select, message } from "antd";
import axios from "axios";
import LayoutUtama from "../components/Layoututama";
import { Content } from "antd/es/layout/layout";
import { EditFilled, DeleteFilled } from "@ant-design/icons";

const { Option } = Select;

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios
      .get("http://localhost:5000/api/pegawai")
      .then((response) => {
        setEmployees(response.data.pegawai);
      })
      .catch(() => {
        message.error("Failed to fetch employees");
      });
  };

  const addEmployee = (values) => {
    axios
      .post("http://localhost:5000/api/pegawai", values)
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
      .put(`http://localhost:5000/api/pegawai/${editingEmployee._id}`, values)
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
      .delete(`http://localhost:5000/api/pegawai/${id}`)
      .then(() => {
        fetchEmployees();
        message.success("Employee deleted successfully");
      })
      .catch(() => {
        message.error("Failed to delete employee");
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
              rules={[
                { required: true, message: "Please input the username!" },
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="tempat_lahir"
              rules={[
                { required: true, message: "Please input the place of birth!" },
              ]}
            >
              <Input placeholder="Tempat Lahir" />
            </Form.Item>
            <Form.Item
              name="tanggal_lahir"
              rules={[
                { required: true, message: "Please input the date of birth!" },
              ]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="jenis_kelamin"
              rules={[{ required: true, message: "Please select the gender!" }]}
            >
              <Select placeholder="Jenis Kelamin">
                <Option value="Laki-laki">Laki-laki</Option>
                <Option value="Perempuan">Perempuan</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="alamat"
              rules={[{ required: true, message: "Please input the address!" }]}
            >
              <Input placeholder="Alamat" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input the password!" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item
              name="role"
              rules={[{ required: true, message: "Please select the role!" }]}
            >
              <Select placeholder="Role">
                <Option value="admin">Admin</Option>
                <Option value="pegawai">Pegawai</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add Employee
              </Button>
            </Form.Item>
          </Form>
          <Table
            columns={employeeColumns}
            dataSource={employees}
            rowKey="_id"
          />
          <Modal
            title="Edit Employee"
            visible={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Form initialValues={editingEmployee} onFinish={handleModalOk}>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input the username!" },
                ]}
              >
                <Input placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="tempat_lahir"
                rules={[
                  {
                    required: true,
                    message: "Please input the place of birth!",
                  },
                ]}
              >
                <Input placeholder="Tempat Lahir" />
              </Form.Item>
              <Form.Item
                name="tanggal_lahir"
                rules={[
                  {
                    required: true,
                    message: "Please input the date of birth!",
                  },
                ]}
              >
                <Input type="date" />
              </Form.Item>
              <Form.Item
                name="jenis_kelamin"
                rules={[
                  { required: true, message: "Please select the gender!" },
                ]}
              >
                <Select placeholder="Jenis Kelamin">
                  <Option value="Laki-laki">Laki-laki</Option>
                  <Option value="Perempuan">Perempuan</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="alamat"
                rules={[
                  { required: true, message: "Please input the address!" },
                ]}
              >
                <Input placeholder="Alamat" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Employee
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
