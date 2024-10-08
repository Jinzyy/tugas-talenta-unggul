import React, { useState } from "react";
import { Form, Input, Button, Alert, Typography } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import config from "../config";

const { Title } = Typography;

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onFinish = (values) => {
    axios
      .post(`${config.API_BASE_URL}/api/login`, values)
      .then((response) => {
        if (response.data.success) {
          // Menyimpan token ke localStorage
          sessionStorage.setItem("token", response.data.token);
          localStorage.setItem("token", response.data.token);
          // Redirect ke halaman home
          navigate("/home");
        } else {
          setError(response.data.message);
        }
      })
      .catch(() => {
        setError("Gagal login. Silahkan coba lagi!");
      });
  };

  return (
    <div style={containerStyle}>
      <div style={formStyle}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Dashboard CV Berkat
        </Title>
        {error && (
          <Alert
            message={error}
            type="error"
            style={{ marginBottom: "10px" }}
          />
        )}
        <Form
          name="login-form"
          onFinish={onFinish}
          style={{ maxWidth: "300px", margin: "auto" }}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Masukkan username anda!" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Masukkan password anda!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#f0f2f5",
};

const formStyle = {
  backgroundColor: "#ffffff",
  padding: "40px 20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  textAlign: "center",
};

export default Login;
