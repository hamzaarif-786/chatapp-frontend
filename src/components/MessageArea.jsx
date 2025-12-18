import React, { useState, useRef,useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import EmojiPicker from "emoji-picker-react";
import { RiEmojiStickerLine } from "react-icons/ri";
import { MdSend } from "react-icons/md";
import { FaImages } from "react-icons/fa";
import dp from "../assets/dp.webp";
import { setSelectedUser } from "../redux/userSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import axios from "axios";
import { serverUrl } from "../main";
import { setMessages } from "../redux/messageSlice";

function MessageArea() {
  const dispatch = useDispatch();
  const { selectedUser, userData,socket } = useSelector((state) => state.user);
  const { messages } = useSelector((state) => state.message);

  const [showPicker, setShowPicker] = useState(false);
  const [input, setInput] = useState("");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const imageRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSendMessage = async (e) => {
    
    e.preventDefault();

    if (!input.trim() && !backendImage) return;

    const text = input;
    const imageFile = backendImage;

    setInput("");
    setFrontendImage(null);
    setBackendImage(null);

    try {
      const formData = new FormData();
      formData.append("message", text);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        { withCredentials: true }
      );

      dispatch(setMessages([...messages, res.data]));
    } catch (error) {
      console.log(error);
    }
  };

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
    setShowPicker(false);
  };
  useEffect(()=>{
socket.on("newMessage",(mess)=>{
  dispatch(setMessages([...messages,mess]))
})
return ()=>socket.off("newMessage")
  },[messages,setMessages])

  return (
    <div
      className={`w-full lg:w-[70%] bg-slate-200 h-screen flex flex-col ${
        selectedUser ? "flex" : "hidden lg:flex"
      }`}
    >
      {/* ================= HEADER ================= */}
      {selectedUser && (
        <div className="h-[70px] bg-[#0598c9] flex items-center gap-4 px-4 shadow-lg">
          <IoIosArrowRoundBack
            onClick={() => dispatch(setSelectedUser(null))}
            className="w-9 h-9 text-white cursor-pointer"
          />

          <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
            <img
              src={selectedUser?.image || dp}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-white font-serif text-lg truncate">
            {selectedUser?.name || "User"}
          </h1>
        </div>
      )}

      {/* ================= MESSAGES ================= */}
      {selectedUser && (
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 relative">
          {showPicker && (
            <div className="absolute bottom-[90px] left-4 z-50">
              <EmojiPicker width={260} height={350} onEmojiClick={onEmojiClick} />
            </div>
          )}

          {messages
            ?.filter(
              (m) =>
                (m.sender === userData._id &&
                  m.receiver === selectedUser._id) ||
                (m.sender === selectedUser._id &&
                  m.receiver === userData._id)
            )
            .map((m) =>
              m.sender === userData._id ? (
                <SenderMessage
                  key={m._id}
                  image={m.image}
                  message={m.message}
                />
              ) : (
                <ReceiverMessage
                  key={m._id}
                  image={m.image}
                  message={m.message}
                />
              )
            )}
        </div>
      )}

      {/* ================= INPUT BAR ================= */}
      {selectedUser && (
        <div className="sticky bottom-0 bg-slate-200 py-3 flex justify-center">
          {frontendImage && (
            <img
              src={frontendImage}
              alt=""
              className="w-[80px] absolute bottom-[90px] right-[20%] rounded-lg shadow-lg"
            />
          )}

          <form
            onSubmit={handleSendMessage}
            className="w-[95%] lg:w-[70%] h-[60px] bg-[#0598c9] rounded-full flex items-center gap-4 px-5 shadow-lg"
          >
            <RiEmojiStickerLine
              onClick={() => setShowPicker((prev) => !prev)}
              className="w-6 h-6 text-white cursor-pointer"
            />

            <input
              type="file"
              accept="image/*"
              hidden
              ref={imageRef}
              onChange={handleImage}
            />

            <input
              type="text"
              className="w-full h-full outline-none bg-transparent text-white placeholder-white"
              placeholder="Message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <FaImages
              onClick={() => imageRef.current.click()}
              className="w-6 h-6 text-white cursor-pointer"
            />

{(input.trim() || backendImage) && (
  <button type="submit">
    <MdSend className="w-6 h-6 text-white" />
  </button>
)}



            
          </form>
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}
      {!selectedUser && (
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <h1 className="text-gray-700 text-4xl font-serif">
            Welcome To Chatly
          </h1>
          <p className="text-gray-500 text-xl mt-2">Chat Friendly!</p>
        </div>
      )}
    </div>
  );
}

export default MessageArea;
