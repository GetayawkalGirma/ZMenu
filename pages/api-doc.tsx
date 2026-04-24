"use client";

import { useState, useEffect } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch("/api/swagger")
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error("Failed to load Swagger spec:", err));
  }, []);

  if (!spec) {
    return <div>Loading API documentation...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>ZDish API Documentation</h1>
      <SwaggerUI spec={spec} />
    </div>
  );
}
