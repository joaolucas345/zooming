import logo from './logo.svg';
import './App.css';
import React , {useEffect , useRef , useState} from 'react'

//components
import Toolbar from './comp/Toolbar.js'
import CallUp from './comp/CallPopUp.js'
//icons
import CloseIcon from '@material-ui/icons/Close';
import Peer from 'simple-peer'

let MyStreamSrc = {}
let PartnerStreamSrc ={} 
let URL = "YOUR_URL"
let socket = new WebSocket('ws'+URL.substring(4))
let MyOldStream = {}
let changingScreenProcess = false
let last_partner = ""
//calling you info 
let caller = ""
let signalAccept = {}
let peer = {}
let streamChanged = false
let changingStream = false
let partnerStreamChanging = false
function App() {

  const [widthMyVideo , setWidthMyVideo] = useState('50%')
  const [callIngPopUpVisibility , setCallingPopUpVisibility] = useState(false)
  const [audioState , setAudioState] = useState(false)
  const [yourAudioState , setYourAudioState] = useState(true)
  const [connected , setConnected] = useState()
  const [myUsername , setMyUsername] = useState(null)
  const [partnerUsername , setPartnerUsername] = useState(null)
  const [widthYourVideo , setWidthYourVideo] = useState('50%')
  const [changeStream , setChangeStream] = useState("")
  const [iamasking , setIamasking] = useState(true)
  const [signal , setSignal] = useState(null)
  const [eventListener , setEventListener] = useState(false)
  const [visibilityMyVideo , setVisibilityMyVideo] = useState('visible')
  const [visibilityYourVideo , setVisibilityYourVideo] = useState('visible')

  const MyVideo = useRef()
  const PartnerVideo = useRef()

  socket.onopen = () => {
    setConnected(true)
  }
  // console.log(window.prompt("haha"))  
  useEffect(() => {
    setMyUsername(window.prompt("what is going to be your username?"))
      navigator.mediaDevices.getUserMedia({video:true , audio:true}).then(stream => {
        MyStreamSrc = stream
        MyVideo.current.srcObject = MyStreamSrc
      })
    } , [])
  useEffect(async () => {
    if(connected == true){
      console.log(connected)
      socket.addEventListener("message" , (message) => {
        const incoming = JSON.parse(message.data)
        console.log(incoming)
        if(incoming.type == "calling_you"){
          caller = incoming.from
          signalAccept = incoming.signal
          setCallingPopUpVisibility(true)
          console.log(caller)
          
        }
        if(incoming.type == "calling_you-fresh"){
          caller = incoming.from
          signalAccept = incoming.signal
          acceptCall()
          console.log(caller)
          
        }
        if(incoming.type == "audio"){
          changeAudio(incoming.state)
        }
      })
      socket.send(JSON.stringify({"type":"connect" , "username":myUsername}))
    }
  } , [connected])
  const changeAudio = (t) => {
    setYourAudioState(t)

  } 
  console.log("partner audio state")
  console.log(yourAudioState)
   useEffect(() => {
    if(connected == true){
      socket.send(JSON.stringify({"type":"change-screen" , "friend":partnerUsername}))
    }
  } , [changeStream])

  const full_screen_click = (who) => {
    if(who == 1){
       setWidthMyVideo('100%')
       setVisibilityYourVideo('hidden')
       setWidthYourVideo('1%')
    }else{
      setWidthYourVideo('100%')
      setWidthMyVideo('1%')
      setVisibilityMyVideo('hidden')
    }
  }
  const close_full_screen = () => {
    setVisibilityMyVideo('visible')
    setVisibilityYourVideo('visible')
    setWidthMyVideo('45%')
    setWidthYourVideo('45%')
  }
  const listener = async (message) => {
    const incoming = JSON.parse(message.data)
    if(incoming.type == "call-accepted"){
      // setAudioState(incoming.state)
      peer.signal(incoming.signal)
    }
    if(incoming.type == "change-screen"){
      streamChanged = true
      console.log("screening")
      peer.removeStream(MyOldStream)
      peer.addStream(MyStreamSrc)
      MyOldStream = MyStreamSrc

    }
    if(incoming.type == "regging"){
      changingStream = true
      peer.signal(incoming.signal)
    }
    if(incoming.type == "reg-accepted"){
      peer.signal(incoming.signal)
    }
    if(incoming.type == "tra-res"){
      peer.signal(incoming.signal)
      partnerStreamChanging = true
    }
    if(incoming.type == "tra-accept"){
      console.log("tra got")
      peer.signal(incoming.signal)
    }
  }
  const call =  () => {
    changingScreenProcess = false
    console.log(MyStreamSrc)
     peer = new Peer({initiator:true , trickle:false , stream:MyStreamSrc })
    // new MediaStream(MyStreamSrc).getTracks().forEach(track => {
    //   peer.addTrack(track , MyStreamSrc)
    // })
    console.log(MyStreamSrc.getTracks())
    // peer.addStream(MyStreamSrc)
    MyOldStream = MyStreamSrc
    peer.on('signal' , (signal) => {
      console.log(signal)
      if(signal.type == "regonitiate"){
        peer.signal(signal)
      }else{
        if(partnerStreamChanging == true){
          partnerStreamChanging = false
          socket.send(JSON.stringify({"type":"tra-offer" , "from":myUsername , "to":partnerUsername , "signal":signal}))
        }else{
      if(changingStream == false){
      if(streamChanged == false){
        console.log("call-person sent")
        socket.send(JSON.stringify({"type":"call-person" , "from":myUsername , "to":partnerUsername , "signal":signal}))
        last_partner = partnerUsername
      }else{
        console.log("reg-offer sent")
        socket.send(JSON.stringify({"type":"reg-offer" , "from":myUsername , "to":partnerUsername , "signal":signal}))
        streamChanged = false
      }
      }else{
        console.log("reg-answer sent")
        socket.send(JSON.stringify({"type":"reg-answer" , "from":myUsername , "to":partnerUsername , "signal":signal}))
        changingStream = false
      }
      // changingStream = false
      }
    }
    })

    peer.on("stream", (stream) => {
      console.log(stream)
      PartnerVideo.current.srcObject = stream
    })

    if(eventListener == false){
      socket.addEventListener("message" , listener)
    }
    setEventListener(true)


  }
  const changeAudioState = () => {
    setAudioState(!audioState)
    socket.send(JSON.stringify({"type":"audio" , "to":[caller, partnerUsername] , "state":audioState}))
  }
  const acceptCall = () => {
    changingStream = true
    changingScreenProcess = false
    peer = new Peer({initiator:false , trickle:false , stream:MyStreamSrc})
    MyOldStream = MyStreamSrc
    // new MediaStream(MyStreamSrc).getTracks().forEach(track => {
    //   peer.addTrack(track , MyStreamSrc)
     
    // })
    peer.on("stream" , (stream) => {
      console.log(stream)
      // console.log(stream)
      PartnerVideo.current.srcObject = stream
    })

    peer.on("signal" , (signal) => {
      console.log("receiving signal from here")
      console.log(signal)
      if(signal.type == "transceiverRequest"){
        socket.send(JSON.stringify({"type":"tra" , "from":myUsername , "to":caller , "signal":signal }))
      }else{
      if(signal.type == "regonitiate"){
        peer.signal(signal)
      }else{
      if(changingStream == false){
      if(streamChanged == false){
        console.log("call-accpeted sent")
        socket.send(JSON.stringify({"type":"call-accept" , "from":myUsername , "to":caller , "signal":signal }))
        last_partner = partnerUsername
        // changingStream = false
      }else{
        console.log("reg-offere sent")
        socket.send(JSON.stringify({"type":"reg-offer" , "from":myUsername , "to":caller , "signal":signal}))
        streamChanged = false
      }
      }else{
        console.log("reg-answere sent")
        socket.send(JSON.stringify({"type":"reg-answer" , "from":myUsername , "to":caller , "signal":signal}))
        changingStream = false
      }
      }
    }
      
    })
    peer.signal(signalAccept)
    // console.log("hehehehheheh")
    setCallingPopUpVisibility(false)
    if(eventListener == false){
      // console.log("heheheuehuehu")
      socket.addEventListener("message" , listener)
    }
    setEventListener(true)
  }

  const change_stream = async (device_type) => {
    // peer.removeStream(MyStreamSrc)
    if(device_type == "screen"){
    await navigator.mediaDevices.getDisplayMedia({
      video: {mediaSource: 'screen'}
    }).then(stream => {
      
      MyStreamSrc = stream
    })
    }else{
      await navigator.mediaDevices.getUserMedia({
        video:true , audio:true
      }).then(stream => {
        MyStreamSrc = stream
      })
    }
    // peer.addStream(MyStreamSrc)
    MyVideo.current.srcObject = MyStreamSrc
    changingScreenProcess = true
    setChangeStream(changeStream + 1)

  }
  const change_to_screen = () => {change_stream("screen")} 
  const change_to_cam = () => {change_stream("cam")}
  return (
    <div>
      
      <header>
        ZOOMING
      </header>
      <main>
        <div className="screen">
          <video autoPlay muted={true} ref={MyVideo} onClick={() => {full_screen_click(1)}} style={{width:widthMyVideo , height:'100%',objectFit:'contain' , visibility:visibilityMyVideo}}></video>
          {
            widthMyVideo == '100%' || widthYourVideo == '100%'? 
              <CloseIcon onClick={close_full_screen} className="close-full-screen">close</CloseIcon>
              :
                <></>
          }
          <CallUp visible={callIngPopUpVisibility} setVisibility={setCallingPopUpVisibility} callerName={caller} acceptCall={acceptCall}></CallUp>
          <video autoPlay muted={!yourAudioState}ref={PartnerVideo} onClick={() => {full_screen_click(2)}} style={{width:widthYourVideo , height:'100%',objectFit:'contain', visibility:visibilityYourVideo }}></video>
        </div>
        <footer>
          <Toolbar audioState={audioState}audioHandler={changeAudioState}changecam={change_to_cam} changescreen={change_to_screen}  setpartnername={setPartnerUsername} call={call} username={myUsername}></Toolbar>
        </footer>

      </main>
    </div>
  );
}

export default App;
    // navigator.mediaDevices.getDisplayMedia({
    //   video: {mediaSource: 'screen'}
    // }).then(stream => {
    //   MyStreamSrc = stream
    //   MyVideo.current.srcObject = MyStreamSrc
    // })
    // navigator.mediaDevices.getDisplayMedia({
    //   video: {mediaSource: 'screen'}
    // }).then(stream => {
    //   PartnerStreamSrc = stream
    //   PartnerVideo.current.srcObject = PartnerStreamSrc
    // })
