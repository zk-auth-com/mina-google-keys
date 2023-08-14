<script>
    import { onMount } from 'svelte'
    // import ZkappClient from "$lib/zkapp/zkappClient";

    const clientId = import.meta.env.VITE_CLIENT_ID;
    // const network = import.meta.env.VITE_BERKELEY_ENDPOINT;
    // const zkAppPublicKey = import.meta.env.VITE_PUBLIC_KEY_SMART_CONTRACT;
    let recipient = '';
    // @ts-ignore
    let amount = 0;
    let nonce = 0;
    let jwt = '';
    let email = '';
    let signature = '';
    let loading = true;


    async function getMoney() {
        try {
            const response = await fetch('http://91.240.85.151:3001/send_to_contract', {
                method: "GET" // default, so we can ignore
            });
            const data = await response.json();
            console.log(data)
        } catch (err) {
            console.log(`Error: ${err}`)
        } 
    }

    function sendMoney() {
        fetch('http://localhost:3001/send_tx_from_contract', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // @ts-ignore
            body: {
                // @ts-ignore
                "tx_data": {
                    // @ts-ignore
                    "email": email,
                    "recipient": recipient,
                    "nonce": nonce,
                    // @ts-ignore
                    "amount": amount
                },
                "signature": signature
            }
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

    onMount(async () => {
        // @ts-ignore
        const handleCredentialResponse = async (response) => {
            // const zkApp = new ZkappClient();
            // zkApp.setContract(network, zkAppPublicKey);
            // const nonce = zkApp.getStateValue("nonce");

            
            console.log('Encoded JWT ID token: ' + response.credential);
            jwt = response.credential;
            fetch(`http://localhost:3030/auth/${response.credential}`)
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
                <input class="bg-sky-100 focus:outline-none ml-5" type="number" name="amount" placeholder="0" bind:value={amount}>
            </div>
            <div class="border rounded-lg bg-sky-100 h-16">
                <p class="text-gray-500 ml-28">Recipient</p>
                <input class="bg-sky-100 focus:outline-none ml-5" type="text" name="recipient" placeholder="B62qpkAESZ...23yrZ" bind:value={recipient}>
            </div>
        </div>
        <div class="flex flex-col mt-10">
            <button class="
                border-2 
                rounded-lg 
                border-orange-600 
                text-orange-600 
                hover:text-white 
                hover:bg-orange-800" 
                on:click={getMoney}>
                    Get Money
                </button>
                <button class="
                mt-2 
                border-2 
                rounded-lg 
                border-orange-600 
                text-orange-600 
                hover:text-white 
                hover:bg-orange-800" 
                on:click={sendMoney}>
                    Send Money
                </button>
            </div>
        </div>
        {/if}
</div>
{/if}
</main>