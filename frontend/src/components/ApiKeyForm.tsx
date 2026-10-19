import React from 'react'
import Cookies from 'js-cookie'
import '../index.css'

export const ApiKeyForm = () => {
  var formHidden:boolean = false;
  
  const handleSaveKey = (apiKey: string) => {
    Cookies.set('x-api-key', apiKey, {
      expires: 7, // Expires in 7 days
      secure: false, // Only send over HTTPS (use false for localhost http)
      sameSite: 'strict', // Prevents the cookie from being sent in cross-site requests
      path: '/', // Available across the entire site
    })
  }
  
  return (
    <div className={Cookies.get('x-api-key') != null ? 'hidden' : ''}>
        <input
          type="text"
          onChange={(e) => {
          handleSaveKey(e.target.value)
          }}
        />
  
        <button onClick={() => {formHidden == false ? formHidden = true : formHidden=false}}>save</button>
    </div>
  );
}
