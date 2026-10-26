import Cookies from 'js-cookie'
import '../App.css'

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
    <div className={`${Cookies.get('x-api-key') != null ? 'hidden' : ''} flex h-screen text-white justify-center`}>
      <div>
        <h2 className='text-center font-bold text-5xl mt-30'>Welcome!</h2>
        <input
          type="text"
          onChange={(e) => {
          handleSaveKey(e.target.value)
          }}
        placeholder='1234abcd-1234-1234-1234-123456abcdef'
        className='bg-gray-600 w-md h-1/20 border p-2 rounded-md mt-30 mr-5'
        />
  
        <button 
          onClick={() => {
            formHidden == false ? formHidden = true : formHidden=false; window.location.reload();
          }}
          className='border rounded-md bg-red-700 h-1/20 px-4'
          >save</button>

      </div>
    </div>
  );
}
