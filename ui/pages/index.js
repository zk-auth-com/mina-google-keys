import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  function handleCallbackResponse(response){
    console.log(`Encoded JWT ID token: ${response.credential}`);
  }

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: "622365820763-19ouop80hhhsferq8mgaclgo2gq1i63c.apps.googleusercontent.com",
      callback: handleCallbackResponse
    })

    window.google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      {theme: "outline", size: "large"}
    )
  }, []);

  return (
    <main className='flex flex-col items-center justify-center h-screen'>
    <h1 className='text-center mb-24 text-3xl font-bold'>Google Autentification Keys</h1>
      <div id="signInDiv"></div>
    </main>
  )
}
