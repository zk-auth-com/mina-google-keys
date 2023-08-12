<script>
    import { onMount } from 'svelte'
    // import ZkappClient from "$lib/zkapp/zkappClient";

    const clientId = import.meta.env.VITE_CLIENT_ID;
    // const network = import.meta.env.VITE_BERKELEY_ENDPOINT;
    // const zkAppPublicKey = import.meta.env.VITE_PUBLIC_KEY_SMART_CONTRACT;
    let recipient = '';
    let amount = '';
    const nonce = '0';
    /**
   * @type {any}
   */
    let jwt;

    async function getMoney() {
        const response = await fetch('');
        const answer = await response.json()

    }

    async function sendMoney() {
        const response = await fetch('');
        const answer = await response.json()

    }

    onMount(async () => {

        // @ts-ignore
        const handleCredentialResponse = async (response) => {
            // const zkApp = new ZkappClient();
            // zkApp.setContract(network, zkAppPublicKey);
            // const nonce = zkApp.getStateValue("nonce");

            jwt = response.credential;

            console.log('Encoded JWT ID token: ' + response.credential);
            fetch(`http://localhost:3030/auth/${response.credential}`)
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
    <div class="
    bg-white
    flex 
    flex-col
    h-61 
    border 
    border-zinc-400
    rounded-lg">
    <div class="flex flex-col mt-3 mr-24 ml-24 mb-24 gap-4">
        {#if !jwt}
            <div class="mt-16" id="signInDiv"/>
        {:else}
        <div class="flex flex-col gap-4">
            <div class="border rounded-lg bg-sky-100 h-16 w-72">
                <p class="text-gray-500 ml-28">Amount</p>
                <input class="bg-sky-100 focus:outline-none ml-5" type="text" name="amount" placeholder="0" bind:value={amount}>
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
        {/if}
        </div>
    </div>
</main>