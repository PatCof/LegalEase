import './App.css'
import {Upload} from "lucide-react"
import {useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent} from "react"
import axios from "axios";
import parse from "html-react-parser";

interface Message {
  index: Number;
  sender : "user" | "ai";
  messageText : string;
  time : string;
}

function App() {
  const [text ,setText] = useState("");
  const [submittedInput, setSubmittedInput] = useState<String>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textAreaDivRef = useRef<HTMLDivElement>(null);
  const messageDiv = useRef<HTMLDivElement>(null);
  
  {/*TextArea resizing*/}
  useEffect(() => {
    const textarea = textAreaRef.current;
    if(textarea){
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
    },[text]);

  {/*Auto Positioning of Text Area after user input*/}
  useEffect(() => {
    if(submittedInput.length > 0){
      const textarea = textAreaDivRef.current;
        if(textarea){
          textarea.style.marginTop = "auto";
        }
      }
    },[submittedInput]);

  {/*Auto Scroll Latest Message into View*/}
  useEffect(() => {
    messageDiv.current?.scrollIntoView({behavior: "smooth"});
  }, [messages, loading]);


  const fetchData = () =>{
      setLoading(true);

      axios
      .post('https://legal-ease-beryl.vercel.app/sendUserInput', {
        content: submittedInput,
      })
      .then((response) => {
        setMessages(prev => [...prev, response.data]);
      })
      .catch((error) => 
      setMessages(prev => [...prev, error]))
      .finally(() => setLoading(false));
    }
    

  useEffect(()=> {
    if(submittedInput){
      if(loading === false){
        fetchData();
      }
    }}, [submittedInput]);


  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>): void =>{
    setText(event.target.value);
  }

  const handleSendInput = () : void =>{
    if(text.trim() !== ""){
      const current_date = new Date().toLocaleString();
      const message: Message = {
        index : messages.length,
        sender: "user",
        messageText: text.trim(),
        time: current_date
      }
      setSubmittedInput(text);
      setMessages(prev => [...prev, message]);
      setText("");
    }
  }


  const enterInput = (event: KeyboardEvent): void =>{
    if(event.key == "Enter" && text.trim().length > 0){
      if(event.shiftKey){
        
      }else{
        if(text.trim() !== ""){
        event.preventDefault();
        handleSendInput();
        }
      }
    }
  }

  return (
    <>
<div className="h-screen flex justify-center">
        <div className="flex justify-center items-center flex-col h-full">
          {messages.length == 0
            ?
            <h1 className="mb-10 text-xl">Any Philippine Laws you wanted to learn or summarize?</h1>
            :
            <div id="message-list" className="no-scrollbar overflow-scroll text-pretty flex flex-col w-full items-center">
              {messages.map(message => (
                message.sender === "user" ?
                  <div key={`${message.index}`} className="flex justify-end items-end w-150">
                    <div className="w-auto h-auto bg-blue-300 m-3 rounded-lg p-2 flex justify-end">{parse(message.messageText)}</div>
                  </div>
                  :
                  <div key={`${message.index}`} className="flex justify-start items-start w-150">
                    <div className="w-auto h-auto bg-gray-300 m-3 rounded-lg p-2 flex justify-start flex-col">{parse(message.messageText)}</div>
                  </div>
              ))}
              
              {/* Spinner renders conditionally, after the messages */}
              {loading && (
                 <div className="flex justify-start items-start w-150">
                   <div className="w-auto h-auto bg-gray-300 m-3 rounded-lg p-2 flex justify-start flex-col">
                     <svg className="text-gray-500 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                       <path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                       <path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"></path>
                     </svg>
                   </div>
                 </div>
              )}
              
              {/* Single anchor point for scrolling placed at the very end */}
              <div ref={messageDiv}></div>
            </div>
          }
          
          <div ref={textAreaDivRef} className={"flex w-150 pb-10"}>
            {/* Bound disabled attribute to loading state directly */}
            <textarea id="TextArea" ref={textAreaRef} value={text} disabled={loading} placeholder="Ask Philippine Law questions..." rows={1} onKeyDown={enterInput} onChange={handleTextAreaChange} className={`no-scrollbar pt-1.5 pb-1.5 text-xl border resize-none border-[#BFBFBF] focus:border-[#FFFFFF] bg-gray-100 w-150 pl-4 rounded-2xl pr-10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}></textarea>
            <div className="pr-2 flex justify-end items-center">
              <button disabled={loading} onClick={handleSendInput} className={`bg-black w-8 h-8 rounded-full flex justify-center items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload color="#FFFFFF"></Upload>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
