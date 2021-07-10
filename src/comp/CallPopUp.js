import React from 'react'
import './CallPopUp.css'
import Peer from 'simple-peer'
export default function CallPopUp({visible , setVisibility , callerName , acceptCall })
{

    if (visible == false) return (<></>);
    return(
        <div className="call-pop-up-main">
            <h1>{callerName} is calling you</h1>
            <div>
            <button id="accept-btn" onClick={acceptCall}>accept</button>
            <button id="deny-btn" onClick={() => {setVisibility(false)}}>deny</button>
            </div>
        </div>
    );
}