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
    <div className='bg-[#1f1f1f] w-full h-screen kedebideri-regular text-white '>
      <ApiKeyForm />
      <header className='flex justify-between px-15 py-5'>
        <img src="./pg-logo.png" alt="p&g logo" className='w-1/28'/>
        <button onClick={handleApiKeyChange} className={`${Cookies.get('x-api-key') == undefined ? "hidden" : ""} border border-[#980b17] rounded-lg bg-[#e81123] px-4 hover:bg-[#980b17]`}>Sign Out</button>
      </header>
      <DataTable/>
    </div>
  )
}

export default App
