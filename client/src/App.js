import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000")
      .then(res => {
        setMessage(res.data);
      })
      .catch(err => {
        console.error(err);
        setMessage("Failed to connect to server");
      });
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>CityLinker</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;
