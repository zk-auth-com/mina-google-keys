import {Run} from "./server.js"
// import {deployContract, updateEmail} from "./contract.js"


const main = async () => {
	// const contract = await deployContract("test@test.test")
	// console.log(contract)
	// const contract = await updateEmail("test@test.test")
	// console.log(contract)
	await Promise.all([Run()])
}

main().catch(console.error)
