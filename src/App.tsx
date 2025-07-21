import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    // const messageLog = document.getElementById("log-container")
    const ws = useRef(null);
    const [chatInput, setChatInput] = useState('')

    let pingInterval;

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080")
        ws.current.addEventListener('close', ev => {
            stopPinging()
            appendChat("WebSocket Disconnected", true);
        })

        ws.current.addEventListener('open', ev => {
            console.log("Opened Websocket")
            ws.current.send("Hello from client")
            startPinging()
            // appendChat("Connect to Websocket...");
        })

        ws.current.addEventListener('message', ev => {
            appendChat(ev.data)
        })

        return () => {
            if (ws.current.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    class State {
        messages: Array<Message>
    }

    class Message {
        message: string;
        error: boolean;
    }

    function startPinging() {
        pingInterval = setInterval(() => {
            ws.current.send("Client is still alive")
            console.log("Sent Ping To WebSocket")
        }, 30000)
    }

    function stopPinging() {
        clearInterval(pingInterval)
    }

    const state: State = { messages: []};

    function handleSubmit(event) {
        if (chatInput == "") {
            return
        }

        ws.current.send(chatInput)
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
        // state.messages.push(message)
        // console.log(state)
        return 
    }

    const handleChatInputChange = (ev) => {
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
