import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    // const messageLog = document.getElementById("log-container")
    const ws = new WebSocket("ws://localhost:8080")
    const [chatInput, setChatInput] = useState('')

    ws.addEventListener('close', ev => {
        appendChat("WebSocket Disconnected", true);
    })

    ws.addEventListener('open', ev => {
        console.log("Opened Websocket")
        ws.send(JSON.stringify("Hello from client"))
        appendChat("Connect to Websocket...");
    })

    ws.addEventListener('message', ev => {
        appendChat(ev.data)
    })


    class State {
        messages: Array<Message>
    }

    class Message {
        message: string;
        error: boolean;
    }

    const state: State = { messages: []};

    async function handleSubmit(event) {
        if (chatInput == "") {
            return
        }

        try {
            // const resp = await fetch('/', {
            //     method: 'POST',
            //     body: msg,
            // })
            
            const resp = ws.send(JSON.stringify(chatInput))
            console.log(resp)

            if (resp != null) {
                appendChat(chatInput, false)
            }

            if (resp.status !== 202) {
                throw new Error(`Unexpected HTTP Status ${resp.status} ${resp.statusText}`)
            }
        } catch (err) {
            appendChat(`Submit Failed: ${err.message}`, true)
        }
    }

    function appendChat(text, error) {
        if (error) {
            let message: Message = {
                message: `${new Date().toLocaleTimeString()}: ${text}`,
                error: true
            }
            state.messages.push(message)
            return
        } 

        let message: Message = {
            message: `${new Date().toLocaleTimeString()}: ${text}`,
            error: false
        }
        return 
    }

    const handleChatInputChange = (ev) =>  {
        setChatInput(event.target.value);
    };

  return (
    <>
        <div className="chatbox-container">
            <div className="log-container">
                {
                    state.messages.map((message) => {
                        () => {
                            if (message.error) {
                                <p class="error">{message.message}</p>
                            } else {
                                <p>{message.message}</p>
                            }
                        }
                    })
                }
            </div> 
            <form id="message-form" action={handleSubmit}>
                <label>
                    Message:
                    <input id="chat-input" type="text" value={chatInput} onChange={handleChatInputChange} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        </div>
    </>
  )
}

export default App
