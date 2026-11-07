import Cookies from 'js-cookie'
import '../App.css'
import { useState } from 'react'
import { apiFetch } from '../apiFetch'

interface props {
  onSuccess: () => void
}

export const ApiKeyForm = ({ onSuccess }: props) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('')
  const handleSaveKey = (apiKey: string) => {
    Cookies.set('x-api-key', apiKey, {
      expires: 7, // Expires in 7 days
      secure: false, // Only send over HTTPS (use false for localhost http)
      sameSite: 'strict', // Prevents the cookie from being sent in cross-site requests
      path: '/', // Available across the entire site
    })
  }

  return (
    <div className='flex w-full pt-30 justify-center text-center'>
      <div className='flex flex-col w-full justify-center items-center'>
        <h2 className='text-5xl sm:text-7xl md:text-8xl lg:9xl'>Welcome!</h2>
        <div className='flex flex-col md:flex-row pt-10 lg:pt-20 w-full justify-center items-center gap-3'>
          <input
            autoComplete="off"
            type="text"
            onChange={(e) => {
              setApiKeyInput(e.target.value)
            }}
            value={apiKeyInput}
            placeholder="1234abcd-1234-1234-1234-123456abcdef"
            className='w-3/4 md:w-1/4 text-center md:text-left white-border py-2'
          />
          <button
            onClick={async () => {
              if (apiKeyInput.trim() !== '') {
                await apiFetch("", {headers: {'x-api-key': apiKeyInput.trim()}}).then((res) => {
                  if (!res.ok) {
                    switch (res.status) {
                      case 401:
                        alert(`Wrong API key!.`)
                        return
                      case 403:
                        alert(`Unauthorized access.`)
                        return
                      default:
                        alert(
                          `Request failed with status code ${res.status}. Try again later.`
                        )
                        return
                    }
                  }

                  handleSaveKey(apiKeyInput.trim());
                  onSuccess();
                }).catch(err => alert(`Network error: ${err}`))
              }
            }}
            className='red-button py-2 px-10'
          >
            save
          </button>
        </div>
      </div>
    </div>
  )
}
