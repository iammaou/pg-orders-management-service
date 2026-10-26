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
    <div className='bg-gray-800 w-full h-screen kedebideri-regular'>
      <ApiKeyForm />
      <button onClick={handleApiKeyChange} className={Cookies.get('x-api-key') == undefined ? "hidden" : ""}>change api key</button>
      <DataTable/>
    </div>
  )
}

export default App
