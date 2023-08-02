import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import touchContract from './TouchContract'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  async function handleCallbackResponse(response){
    console.log(`Encoded JWT ID token: ${response.credential}`);

    const returnData = await touchContract()

    fetch(`http://localhost:3030/auth/${response.credential}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json' 
      },
      body: returnData
    })
    .then((response) => {
      if(!response.ok){
        throw new Error('Network response was not ok');
      }
      return response.json()
    })
    .then((data) => {
      console.log(data)
    })
    .catch((error) => {
      console.error(error)
    })
  }

  useEffect(() => {
    const initializeGoogleAccounts = async () => {
      try {
        await window.google.accounts.id.initialize({
          client_id: "116089001249-mb14nbpt1n9o1q1dpbrho6ss234iqf18.apps.googleusercontent.com",
          callback: handleCallbackResponse
        });
  
        window.google.accounts.id.renderButton(
          document.getElementById("signInDiv"),
          { theme: "outline", size: "large" }
        );
      } catch (error) {
        console.error(error);
      }
    };

    initializeGoogleAccounts();
  }, []);

  return (
    <main className='flex flex-col items-center justify-center h-screen'>
    <h1 className='text-center mb-24 text-3xl font-bold'>Google Autentification Keys</h1>
      <div id="signInDiv"></div>
    </main>
  )
}
