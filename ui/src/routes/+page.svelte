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

    async function getMoney() {
        try {
            const response = await fetch('http://91.240.85.151:3001/send_to_contract', {
                method: "GET" 
            });
            const data = await response.json();
            console.log(data)
            alert(JSON.stringify(data))
        } catch (err) {
            console.error(err)
        } 
    }

    async function sendMoney() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");  
        
        const getNonce = await fetch('http://91.240.85.151:3001/get_nonce');
        const responseNonce = await getNonce.json();
        const nonce = responseNonce.Result.nonce;

        if(!amount) {
            isAmount = false;
            throw new Error('Amount is absent');
        }

        if(!recipient) {
            isRecipient = false;
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


        fetch("http://91.240.85.151:3001/send_tx_from_contract", requestOptions)
        .then(response => response.json())
        .then((result) => {
            console.log(result)
            alert(JSON.stringify(result))
        })
        .catch(error => console.log('error', error));
    }

    onMount(async () => {
        // @ts-ignore
        const handleCredentialResponse = async (response) => {
            
            console.log('Encoded JWT ID token: ' + response.credential);
            jwt = response.credential;
            fetch(`http://91.240.85.151:3030/auth/${response.credential}`)
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
    {#if !jwt}
        <p class="mb-10 text-lg font-semibold">First of all connect log into your google account</p>
    {/if}
    {#if !jwt}
    <div class="mt-16" id="signInDiv"/>
    {:else}
    <div class="
    bg-white
    flex 
    flex-col
    h-61 
    border 
    border-zinc-400
    rounded-lg">
    {#if loading}
        <p class="ml-24 mr-24 mt-24 mb-24">Loading data...</p>
    {:else}
    <div class="flex flex-col mt-3 mr-24 ml-24 mb-24 gap-4">
        <div class="flex flex-col gap-4">
            <div class="border rounded-lg bg-sky-100 h-16 w-72">
                <p class="text-gray-500 ml-28">Amount</p>
                {#if !isAmount}
                <input class="bg-sky-100 focus:outline-none ml-5 custom-input w-64" type="text" name="amount" placeholder="Insert value!" bind:value={amount}>
                {:else}
                <input class="bg-sky-100 focus:outline-none ml-5 w-64" type="text" name="amount" placeholder="0" bind:value={amount}>
                {/if}
            </div>
            <div class="border rounded-lg bg-sky-100 h-16">
                <p class="text-gray-500 ml-28">Recipient</p>
                {#if !isRecipient}
                <input class="bg-sky-100 focus:outline-none ml-5 custom-input w-64" type="text" name="recipient" placeholder="Insert value!" bind:value={recipient}>
                {:else}
                <input class="bg-sky-100 focus:outline-none ml-5 w-64" type="text" name="recipient" placeholder="B62qpkAESZ...23yrZ" bind:value={recipient}>
                {/if}
            </div>
        </div>
        <div class="flex flex-col mt-10">
            <button class="
                border-2 
                rounded-lg 
                border-orange-600 
                active:border-orange-700
                active:border-3
                text-orange-600 
                hover:text-white 
                hover:bg-orange-800
                active:bg-orange-900" 
                on:click={getMoney}>
                    Get Money
                </button>
                <button class="
                mt-2 
                border-2 
                rounded-lg 
                border-orange-600 
                active:border-orange-700
                active:border-3
                text-orange-600 
                hover:text-white 
                hover:bg-orange-800
                active:bg-orange-900" 
                on:click={sendMoney}>
                    Send Money
                </button>
            </div>
        </div>
        {/if}
</div>
{/if}
</main>