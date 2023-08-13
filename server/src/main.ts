import server from "./server"


const main = async () => {
	await Promise.all([server()])
}

main().catch(console.error)
