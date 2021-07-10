const express = require('express')
const app = express()
const {Server} = require('ws')
const cors = require('cors')
app.use(cors())
const path = require("path")
const bodyParser = require('body-parser')
app.use(bodyParser())
const server = app.listen(3001)
app.use(express.static(path.join(__dirname , ".." , "build")))
const ws = new Server({server:server})

let USER_DB = []

ws.on('connection' , (socket) => {
    let user_template = {}
    socket.addEventListener('message' , (message) => {
        const incoming  =JSON.parse(message.data)
        // console.log(incoming)
        if(incoming.type == 'connect'){
            user_template = {'username':incoming.username , 'instance':socket}
            USER_DB.push(user_template)
            // console.log(USER_DB)
        }
        if(incoming.type == "call-person"){
            USER_DB.map(user => {
                // console.log("hheheh")
                if(user.username == incoming.to){
                
                    user.instance.send(JSON.stringify({"type":"calling_you" , "from":incoming.from , "signal":incoming.signal}))
                }
            })
        }
        if(incoming.type == "call-person-fresh"){
            console.log('received')
            USER_DB.map(user => {
                // console.log("hheheh")
                if(user.username == incoming.to){
                    console.log("asd")
                    console.log(incoming.to)
                    user.instance.send(JSON.stringify({"type":"calling_you-fresh" , "from":incoming.from , "signal":incoming.signal}))
                }
            })
        }
        if(incoming.type == "call-accept"){
            USER_DB.map(user => {
                // console.log("hheheh")
                if(user.username == incoming.to){
                
                    user.instance.send(JSON.stringify({"type":"call-accepted" , "from":incoming.from , "signal":incoming.signal}))
                }
            })
        }
        if(incoming.type == "change-screen"){
            socket.send(JSON.stringify({"type":"change-screen"}))
            // USER_DB.map(user => {
            //     // console.log("hheheh")
            //     if(user.username == incoming.friend){
            //         console.log("right1")
            //         console.log(incoming.friend)
            //         user.instance.send(JSON.stringify({"type":"change-screen"}))
            //     }
            // })
        }
        if(incoming.type == "reg-offer"){
            // socket.send(JSON.stringify({"type":"change-screen"}))
            USER_DB.map(user => {
                console.log("hhehehs")
                if(user.username == incoming.to){
                    // console.log("right1")
                    console.log(incoming.to)
                    user.instance.send(JSON.stringify({"type":"regging" ,"signal":incoming.signal}))
                }
            })
        }
        if(incoming.type == "reg-answer"){
            // socket.send(JSON.stringify({"type":"change-screen"}))
            USER_DB.map(user => {
                console.log("hhehehs")
                if(user.username == incoming.to){
                    // console.log("right1")
                    console.log(incoming.to)
                    user.instance.send(JSON.stringify({"type":"reg-accepted" ,"signal":incoming.signal}))
                }
            })
        }
        if(incoming.type == "audio"){
            // socket.send(JSON.stringify({"type":"change-screen"}))
            USER_DB.map(user => {
                console.log("hhehehs")
                if(user.username == incoming.to[0] || user.username == incoming.to[1] ){
                    user.instance.send(JSON.stringify({"type":"audio" ,"state":incoming.state}))
                }
            })
        }
        if(incoming.type == "tra"){
            USER_DB.map(user => {
                console.log("hhehehs")
                if(user.username == incoming.to ){
                    user.instance.send(JSON.stringify({"type":"tra-res" ,"signal":incoming.signal}))
                }
            })
        }
        if(incoming.type == "tra-offer"){
            USER_DB.map(user => {
                console.log("hhehehs")
                if(user.username == incoming.to ){
                    user.instance.send(JSON.stringify({"type":"tra-accept" ,"signal":incoming.signal}))
                }
            })
        }
    })
    socket.on("close",() => {
        const NewUserArray = []
        USER_DB.map(username => {
            if(username.username != user_template.username){
                NewUserArray.push(username)
            }
        })
        USER_DB = NewUserArray
        // console.log(USER_DB)
    })
})

