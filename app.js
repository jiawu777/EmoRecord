const express = require('express')
const PORT = 3000
const app = express()

app.get('/',(req,res)=>{
    res.send(`Hi!`)
})

app.listen(PORT,()=>{
    console.log(`app is running on http://localhost:${PORT}`)
})