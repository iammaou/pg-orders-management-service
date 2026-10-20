import './App.css'
import Cookies from 'js-cookie'
import {ApiKeyForm} from './components/ApiKeyForm'
import { DataTable } from './components/DataTable'

function App() {
  function handleApiKeyChange(){
    Cookies.remove('x-api-key');
    window.location.reload();
  }

  return (
    <div>
      <ApiKeyForm />
      <button onClick={handleApiKeyChange}>change api key</button>
      <DataTable />
    </div>
  )
}

export default App
