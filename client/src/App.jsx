import { useEffect, useState } from 'react'

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import './App.css'

function App() {
  const [count, setCount] = useState(0);

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
    .then(res => res.text())
    .then(data => setMessage(data))
    .catch(err => console.error("Error fetching the backend: ", err));
  }, []);

  return (
    <>

      <div>
        <h1>FAST UBTS </h1>
        <p> {message} </p>
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    
    </>

  )
}

export default App
