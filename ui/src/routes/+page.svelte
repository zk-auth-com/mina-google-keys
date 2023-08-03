<script>
    import { onMount } from 'svelte'

    const clientId = import.meta.env.VITE_CLIENT_ID;

    const recipient = 'B62qr9xRiL2qgiRydwzQLDcxnSwXzPUHogNK9myYVVaxNunyBAbouKo'
    const nonce = '0'
    const amount = '55'

    onMount(async () => {

        // @ts-ignore
        const handleCredentialResponse = async (response) => {
            console.log('Encoded JWT ID token: ' + response.credential);
            fetch(`http://localhost:3030/auth/${response.credential}/${recipient}/${nonce}/${amount}`)
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

<main class='flex flex-col items-center justify-center h-screen'>
    <h1 class='text-center mb-24 text-3xl font-bold'>Google Autentification Keys</h1>
    <!-- <label for="recipient">Recipient</label>
    <input type="text" id="recipient" bind:value={recipient} />
    <label for="amount">Amount</label>
    <input type="text" id="amount" bind:value={amount} /> -->
    <div id="signInDiv"></div>
</main>