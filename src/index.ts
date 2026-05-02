import http from "node:http"
import { createApplication } from "./app"

async function main(){
    try {
        const server = http.createServer(createApplication())
        const PORT= process.env.PORT? +process.env.PORT : 8080

        server.listen(PORT , ()=>{
            console.log(`Server is running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.log("Error running the server.")
        throw error
    }
}

main()