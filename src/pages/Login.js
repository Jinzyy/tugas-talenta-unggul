import React, { useState } from "react";
import { Form, Input, Button, Alert } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onFinish = (values) => {
    axios
      .post("http://localhost:5000/api/login", values)
      .then((response) => {
        if (response.data.success) {
          navigate("/home");
        } else {
          setError(response.data.message);
        }
      })
      .catch(() => {
        setError("Login failed. Please try again.");
      });
  };

  return (
    <div style={containerStyle}>
      <div style={formStyle}>
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
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
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
};

const formStyle = {
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
};

export default Login;
