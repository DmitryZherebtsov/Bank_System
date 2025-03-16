
import { useState } from "react"

const App = () => {

  const [message, setMessagge] = useState("");

  useState(() => {
    fetch("http://127.0.0.1:8000/")
      .then((response) => response.json())
      .then((data) => setMessagge(data.message))
      .catch((error) => console.error("Error fetching data:", error))
  }, );

  return (
    <div>
      <h1>Test Messagge</h1>
      <p>{message}</p>
    </div>
  )
}

export default App