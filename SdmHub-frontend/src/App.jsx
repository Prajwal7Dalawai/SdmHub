import { useState } from 'react'
import {SDMHUBAuth} from "./pages/SDMHUBAuth"
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SDMHUBAuth />
    </>
  )
}

export default App
