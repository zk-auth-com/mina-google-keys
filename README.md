# Mina Gmail JWT verivication oracle

Please take a look our hachathon project hosted by [@DeveloperDAO](https://twitter.com/developer_dao) and [@MinaProtocol](https://twitter.com/MinaProtocol)

## Demo Loom

[Can see here](https://www.loom.com/share/ec9531e3d5024572a1492b629d613372?sid=6813901f-88d5-4474-ae4a-e57fd7fff171)


## How it works

1. The user visits the web page and expresses a strong desire to log in with Google.
2. The user clicks on the "Login" button.
3. The web page's application requests a Google JWT (JSON Web Token) from the user.
4. The user sends the JWT and specifies the amount of tokens to send to the Smart Contract.
5. The Smart Contract initiates a request to the oracle.
6. The oracle retrieves the public key from Google and verifies the RSA signature.
7. If the signature is valid, the oracle returns the email and nonce signed by the oracle itself.
8. The Smart Contract receives the data and executes the transaction.


## How to build

1. Clone this git repository and change to the project directory

```bash
git clone https://github.com/zk-auth-com/mina-google-keys.git
cd mina-google-keys
```

2. Install project dependencies

```bash
npm install
```

3. Follow the build steps under each part

- [oracle](oracle/)
- [contracts](contracts/)
- [ui](ui/)


