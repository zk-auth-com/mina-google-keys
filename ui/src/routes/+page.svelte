<script>
    // @ts-nocheck
        import { onMount } from 'svelte'
    
        const clientId = import.meta.env.VITE_CLIENT_ID;
        let recipient = '';
        let amount = '';
        let jwt = '';
        let email = '';
        let signature = {};
        let loading = true;
        let isAmount = true;
        let isRecipient = true;
        let responseEmail = null;
        let responseGetMoney = null;
        let responseSendMoney = null;
        let changeEmailTx = null;
    
        async function getMoney() {
            try {
                if(responseEmail || responseSendMoney) {
                    throw new Error("Another operation in progress");
                }
                responseGetMoney = true;
                const response = await fetch('https://mina-demo.zk-auth.com/backend/send_to_contract', {
                    method: "GET" 
                });
                const data = await response.json();
                console.log(data)
                alert(JSON.stringify(data))
                responseGetMoney = false;
            } catch (err) {
                console.error(err)
            } 
        }
    
        function changeEmail() {
            if(responseGetMoney || responseSendMoney) {
                throw new Error("Another operation in progress");
            }
            responseEmail = true;
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");  
            var raw = JSON.stringify({
                "email": email
            });
    
            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow',
                timeout: 360000
            };
    
            fetch("https://mina-demo.zk-auth.com/backend/update_email", requestOptions)
            .then(response => response.json())
            .then((res) => {
                console.log(res)
                changeEmailTx = res.Result.result
                // alert(JSON.stringify(result))
                responseEmail = false;
            })
            .catch((error) => {
                console.log('error', error)
            });
        }
    
        async function sendMoney() {
            if(responseEmail || responseGetMoney) {
                throw new Error("Another operation in progress");
            }
            responseSendMoney = true;
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");  
            
            const getNonce = await fetch('https://mina-demo.zk-auth.com/backend/get_nonce',);
            const responseNonce = await getNonce.json();
            // console.log(responseNonce)
            const nonce = responseNonce.Result.nonce;
    
            if(!amount) {
                isAmount = false;
                responseSendMoney = false
                throw new Error('Amount is absent');
            }
    
            if(!recipient) {
                isRecipient = false;
                responseSendMoney = false
                throw new Error('Recipient is absent');
            }
    
            const raw = JSON.stringify({
                "tx_data": {
                    "email": email,
                    "recipient": recipient,
                    "nonce": Number(nonce),
                    "amount": Number(amount)
                },
                "signature": signature
            });
    
            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
    
            try {
                const response = await fetch("https://mina-demo.zk-auth.com/backend/send_tx_from_contract", requestOptions);
                const responseData = await response.json();
                if(response.ok) {
                    console.log(responseData)
                    alert(JSON.stringify(responseData))
                    responseSendMoney = false;
                } else {
                    console.log('error', error);
                    responseSendMoney = false;
                }
            } catch(e) {
                responseSendMoney = false;
                console.error(e);
            }
    
        }
    
        onMount(async () => {
            // @ts-ignore
            const handleCredentialResponse = async (response) => {
                
                console.log('Encoded JWT ID token: ' + response.credential);
                jwt = response.credential;
                fetch(`https://mina-demo.zk-auth.com/oracle/auth/${response.credential}`)
                .then((response) => {
                    if(!response.ok){
                        throw new Error('Network response was not ok');
                    }
                    return response.json()
                })
                .then((data) => {
                    console.log(data)
                    signature = data.signature;
                    email = data.data.email;
                    loading = false;
                    changeEmail();
                })
                .catch((error) => {
                    console.error(error)
                })
            };
    
            // @ts-ignore
            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
            });
    
            // @ts-ignore
            google.accounts.id.renderButton(
                document.getElementById('signInDiv'),
                { theme: 'outline', size: 'large' } // customization attributes
            );
    
            // @ts-ignore
            google.accounts.id.prompt();
        });
    
    </script>
    
    <svelte:head>
        <script src="https://accounts.google.com/gsi/client"></script>
    </svelte:head>
    
    <main class='flex flex-col items-center justify-center h-screen bg-orange-100'>
        <h1 class='text-center mb-10 text-3xl font-bold'>Google Autentification Keys</h1>
        {#if changeEmailTx}
            <p class="mb-10 text-lg font-semibold">Link of transaction of changing the state of your email: </p>
            <a class="mb-5" href={changeEmailTx}>{changeEmailTx}</a>
        {/if}
        {#if responseGetMoney}
            <p class="mb-10 text-lg font-semibold">Receiving the money...</p>
        {/if}
        {#if responseSendMoney}
            <p class="mb-10 text-lg font-semibold">Sending the money...</p>
        {/if}
        {#if !jwt}
            <p class="mb-10 text-lg font-semibold">First of all connect log into your google account</p>
        {/if}
        {#if !jwt}
        <div class="mt-16" id="signInDiv"/>
        {:else}
        <div class="bg-white flex flex-col h-61 border border-zinc-400 rounded-lg">
        {#if loading}
            <p class="ml-24 mr-24 mt-24 mb-24">Loading data...</p>
        {/if}
        {#if responseEmail}
            <p class="ml-24 mr-24 mt-24 mb-24">Change the previous email to yours...</p>
        {:else}
        <div class="flex flex-col mt-3 mr-24 ml-24 mb-24 gap-4">
            <div class="flex flex-col gap-4">
                <div class="border rounded-lg bg-sky-100 h-16 w-72">
                    <p class="text-gray-500 ml-28">Amount</p>
                    {#if !isAmount}
                    <input class="bg-sky-100 focus:outline-none ml-5 custom-input w-64" 
                    type="text" name="amount" placeholder="Insert value!" bind:value={amount}>
                    {:else}
                    <input class="bg-sky-100 focus:outline-none ml-5 w-64" 
                    type="text" name="amount" placeholder="0" bind:value={amount}>
                    {/if}
                </div>
                <div class="border rounded-lg bg-sky-100 h-16">
                    <p class="text-gray-500 ml-28">Recipient</p>
                    {#if !isRecipient}
                    <input class="bg-sky-100 focus:outline-none ml-5 custom-input w-64" 
                    type="text" name="recipient" placeholder="Insert value!" bind:value={recipient}>
                    {:else}
                    <input class="bg-sky-100 focus:outline-none ml-5 w-64" 
                    type="text" name="recipient" placeholder="B62qpkAESZ...23yrZ" bind:value={recipient}>
                    {/if}
                </div>
            </div>
            <div class="flex flex-col mt-10 gap-2">
                <!-- <button class="border-2 rounded-lg border-orange-600 active:border-orange-700 active:border-3 text-orange-600 hover:text-white hover:bg-orange-800 active:bg-orange-900" 
                    on:click={getMoney}>
                        Receive the money
                    </button> -->
                    {#if responseSendMoney}
                    <div class="border-2 rounded-lg border-orange-900 text-orange-700">
                        Send Money
                    </div> 
                    {:else}
                    <button class="border-2 rounded-lg border-orange-600 active:border-orange-700 active:border-3 text-orange-600 hover:text-white hover:bg-orange-800 active:bg-orange-900" 
                    on:click={sendMoney}>
                        Send Money
                    </button>
                    {/if}
                    <!-- {#if responseEmail}
                        <div class="border-2 rounded-lg border-orange-900 text-orange-700">
                            Change Email
                        </div> 
                    {:else}
                    <button class="border-2 rounded-lg border-orange-600 active:border-orange-700 active:border-3 text-orange-600 hover:text-white hover:bg-orange-800 active:bg-orange-900" 
                    on:click={changeEmail}>
                        Change email
                    </button>
                    {/if} -->
                </div>
            </div>
            {/if}
    </div>
    {/if}
</main>