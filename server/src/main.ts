import {Run} from "./server.js"
import {deployContract} from "./contract.js"


const main = async () => {
	const contract = await deployContract("test@test.test")
	console.log(contract)
	await Promise.all([Run()])
}

main().catch(console.error)
