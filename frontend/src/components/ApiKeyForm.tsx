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
    <div
      className={`${Cookies.get('x-api-key') != null ? 'hidden' : ''} flex h-screen justify-center`}
    >
      <div>
        <h2 className="text-center font-bold text-5xl mt-30">Welcome!</h2>
        <input
          autoComplete="off"
          type="text"
          onChange={(e) => {
            setApiKeyInput(e.target.value)
          }}
          value={apiKeyInput}
          placeholder="1234abcd-1234-1234-1234-123456abcdef"
          className="bg-[#171717] w-md h-1/20 border p-2 rounded-lg mt-30 mr-5"
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
          className="border border-[#980b17] rounded-lg bg-[#e81123] h-1/20 px-4 hover:bg-[#201c1c]"
        >
          save
        </button>
      </div>
    </div>
  )
}
