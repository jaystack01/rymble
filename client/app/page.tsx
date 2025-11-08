"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    axios
      .get("http://localhost:5000/ping")
      .then((res) => {
        if (isMounted) setResponse(res.data.message);
      })
      .catch((err) => console.error("Error fetching data:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <h1>Welcome to Rymble</h1>
      <p>A minimal chat application.</p>
      {response && <p>Server Response: {response}</p>}
    </div>
  );
}
