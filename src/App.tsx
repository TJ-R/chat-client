import { useState, useEffect, useRef } from 'react'
import './App.css'

class State {
     messages: Array<Message>
}

class Message {
    message: string;
    error: boolean;
}

class ChatMessage {
    message: string;
    recieved: string;
    error: boolean;
}

function App() {
    // const messageLog = document.getElementById("log-container")
    
    const [chatState, setChatState] = useState<ChatMessage[]>([])
    const ws = useRef(null);
    const [chatInput, setChatInput] = useState('')

    let pingInterval;

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080")
        ws?.current.addEventListener('close', ev => {
            stopPinging()
            addMessage("WebSocket Disconnected", true);
        })

        ws?.current.addEventListener('open', ev => {
            console.log("Opened Websocket")

            const msg: Message = {
                message: "Hello from client",
                error: false
            }

            ws.current.send(JSON.stringify(msg))
            startPinging()
            addMessage("Connect to Websocket...")
        })

        ws?.current.addEventListener('message', ev => {
            console.log("Recieved: " + ev.data)
            // addRecievedMessage(ev.data)
        })

        return () => {
            if (ws.current.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    

    function startPinging() {

        const msg: Messsage = {
            message: "Client is still alive",
            error: false
        }
        pingInterval = setInterval(() => {
            ws.current.send(JSON.stringify(msg))
            console.log("Sent Ping To WebSocket")
        }, 30000)
    }

    function stopPinging() {
        clearInterval(pingInterval)
    }


    function handleSubmit(event) {
        console.log("Chat Input " + chatInput)
    }

    const addMessage = () => {
        console.log("Adding Message")
        const msg: Message = {
            message: chatInput,
            error: false
        }

        if (chatInput == "") {
            console.log("Message was empty")
            return
        }

        ws.current.send(JSON.stringify(msg))

        const newMessage: ChatMessage = { 
            message: chatInput,
            recieved: false,
            error: false
        }

        setChatState([...chatState, newMessage])
        setChatInput("")
        console.log("After message" + chatState)
    }

    // Seems to create a race condition for displaying
    const addRecievedMessage = (msg: string) => {
        const newMsg: Message = {
            message: msg,
            recieved: true,
            error: false
        }

        setChatState([...chatState, newMsg])
    }


    const handleChatInputChange = (ev) => {
        setChatInput(event.target.value);
    };

  return (
    <>
        <div className="chatbox-container">
            <div className="log-container">
                {chatState.map(message => {
                    if (message.recieved) {
                        return <p>Recieved: {message.message}</p>
                    } else {
                        return <p>{message.message}</p>
                    }
                })}
            </div> 
            <form id="message-form" action={handleSubmit}>
                <label>
                    Message:
                    <input id="chat-input" type="text" value={chatInput} onChange={handleChatInputChange} />
                </label>
                <button onClick={addMessage}>Send Message</button>
            </form>
        </div>
    </>
  )
}

export default App
