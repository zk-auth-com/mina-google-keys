# google-keys-oracle 

An oracle that validate Google JWT

## Setup the configurations

The configuration file is `.env`. It should be placed in the root folder. A sample [.env.sample](./.env.sample) is provided as a reference.

Rename `.env.sample` to `.env` and add parameters for your setup.

#### Configurable parameters

| Parameter   | Required | Remark                                                                           |
| ----------- | -------- | -------------------------------------------------------------------------------- |
| PRIVATE_KEY | Yes      | Private key to sign response payload. Do not share your private key with anyone. |
| PORT        | No       | The server will listen on this port. 3000 will be used if not set.               |

## How to build

1. Clone this git repository and change to the oracle directory

```bash
git clone https://github.com/zk-auth-com/mina-oracle.git
cd oracle
```

2. Install project dependencies

```bash
npm install
```

3. For local development, start a development server.

```bash
npm run dev
```
To stop the server, run below command.

```bash
npm stop
```
