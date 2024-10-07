// import "antd/dist/antd.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { getCLS, getFID, getLCP } from "web-vitals";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

getCLS(console.log);
getFID(console.log);
getLCP(console.log);
