import React, { useEffect , useRef } from 'react'
import dp from "../assets/dp.webp"
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

function ReceiverMessage({image,message}) {
    let scroll=useRef()
    let {selectedUser}=useSelector(state=>state.user)
     const navigate = useNavigate();
   useEffect(()=>{
scroll.current.scrollIntoView({behavior:"smooth"})
   },[message,image])
   const handleImageScroll=()=>{
    scroll.current.scrollIntoView({behavior:"smooth"})
   }
    return (

       <div className='flex items-start gap-[10px]' >

         <div
                            className="w-12 h-12 rounded-full overflow-hidden shadow cursor-pointer bg-white "
                            onClick={() => navigate("/profile")}
                          >
                            <img
                              src={selectedUser.image || dp}
                              alt="profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
               
                  <div ref={scroll} className='w-fit max-w-[500px] px-[20px] py-[10px] bg-[#0598c9] text-white text-[19px] rounded-tl-none rounded-2xl relative left-0 shadow-gray-400 shadow-lg gap-[10px] flex flex-col'>
                  {image &&  <img src={image} alt="" className='w-[150px] rounded-lg' onLoad={handleImageScroll}/>}
                 {message &&  <span >{message}</span>}
                 </div>
      
                 
      
              </div>
    )

}

export default ReceiverMessage