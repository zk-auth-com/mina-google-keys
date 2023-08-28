import {Run} from "./server.js"


const main = async () => {
	await Promise.all([Run()])
}

main().catch(console.error)
