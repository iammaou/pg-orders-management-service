import './App.css'
import Cookies from 'js-cookie'
import {ApiKeyForm} from './components/ApiKeyForm'
import { DataTable } from './components/DataTable'
import { useState } from 'react';

function App() {
  const handleApiKeyChange = () => {
    Cookies.remove('x-api-key', {path: '/'});

    setIsApiKeySet(false);
  }

  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(Cookies.get('x-api-key') != undefined);

  if(!isApiKeySet){
    return(
      <div className='dark-gray w-full h-fit min-h-screen kedebideri-regular text-white'>
        <ApiKeyForm onSuccess={() => setIsApiKeySet(true)}/>
      </div>
    );
  }

  return (
    <div className='dark-gray w-full h-fit min-h-screen p-3'>
      <header className='w-full flex justify-between'>
        <img src="./pg-logo.png" alt="p&g logo" className='w-1/6 sm:w-1/9 md:w-1/11 lg:w-1/25'/>
        <div className='flex justify-center-safe h-full my-auto'>
          <button onClick={handleApiKeyChange} className={`${Cookies.get('x-api-key') == undefined ? "hidden" : ""} red-button kedebideri-semibold button-size`}>Sign Out</button>
        </div>
      </header>
      <div>
        <DataTable onApiKeyReset={handleApiKeyChange}/>
      </div>
    </div>
  )
}

export default App
