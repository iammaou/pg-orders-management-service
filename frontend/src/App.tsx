import './App.css'
import Cookies from 'js-cookie'
import {ApiKeyForm} from './components/ApiKeyForm'

function App() {
  function handleSaveApiKey() {
    console.log(Cookies.get('x-api-key'))
  }

  async function getOrders() {
    await fetch('http://localhost:8080/api/Order', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-api-key': `${Cookies.get('x-api-key')}`,
      },
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        console.log(data)
      })
  }

  return (
    <div>
      <ApiKeyForm />
      <button onClick={getOrders}>fetch</button>
    </div>
  )
}

export default App
