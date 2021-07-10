import react , {useState}from 'react'

//icons
import CallIcon from '@material-ui/icons/Call'
import CallEndIcon from '@material-ui/icons/CallEnd';
import MicIconOn from '@material-ui/icons/Mic';
import MicIconOff from '@material-ui/icons/MicOff';
import ScreenIcon from '@material-ui/icons/WebAsset';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

import './Toolbar.css'
export default function Toolbar({setpartnername , call , username , changecam , changescreen , audioHandler , audioState})
{
    const [realText , setRealTxt] = useState("")
    return(
        <div className="main-toolbar">
            {true == true ?
                <div className="toolbar-uncall">
                <input type="text" onChange={(e) => {setpartnername(e.target.value)}}></input>
                <button onClick={call}>
                    <CallIcon></CallIcon>
                </button>
                </div>
                :
                <button>
                    <CallEndIcon></CallEndIcon>
                </button>
            }
            <h1 color="white">{username}</h1>
            <div className="screen-panel-control">
                <button className="audio" onClick={audioHandler}>
                    {audioState == false?
                    <MicIconOn></MicIconOn>
                    :
                    <MicIconOff></MicIconOff>

                    }
                </button>
                <button className="screen-stream" onClick={changescreen}>
                    <ScreenIcon></ScreenIcon>
                </button>
                <button className="camera-stream" onClick={changecam}>
                    <VideocamIcon></VideocamIcon>
                </button>
            </div>
        </div>
    );
}