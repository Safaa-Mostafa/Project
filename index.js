const PORT = process.env.PORT || 4000
const app = require("./app/src")
const server = app.listen(PORT,()=>console.log(`http://localhost:${PORT}`))
process.on('unhandledRejection',err=>{
    console.log(`Error:${err.message}`);
    console.log('Shutting down server due to unhandled Promise rejection')
    server.close(()=>{
        process.exit(1)
    })
})

