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
      <div className='dark-gray w-full min-h-screen h-full kedebideri-regular text-white'>
        <ApiKeyForm onSuccess={() => setIsApiKeySet(true)}/>
      </div>
    );
  }

  return (
    <div>
      <header>
        <img src="./pg-logo.png" alt="p&g logo"/>
        <button onClick={handleApiKeyChange} className={`${Cookies.get('x-api-key') == undefined ? "hidden" : ""}`}>Sign Out</button>
      </header>
      <DataTable onApiKeyReset={handleApiKeyChange}/>
    </div>
  )
}

export default App
