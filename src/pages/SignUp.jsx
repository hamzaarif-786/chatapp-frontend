import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../main";
import { useDispatch,  } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SignUp() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  let dispatch=useDispatch()
 
  
  let [loading,setLoading]=useState(false)
    const [err, setErr] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { userName, email, password },
        { withCredentials: true }
      );


dispatch(setUserData(result.data))
navigate("/profile")

       setEmail("")
        setPassword("")
        setLoading(false)
        setErr("")
    
      navigate("/login"); // redirect to login

    } catch (error) {
      console.log(error.response?.data?.message);
      
        setLoading(false)
        setErr(error?.response?.data?.message)
    }
  };

  return (
    <div className="w-full h-[100vh] bg-slate-200 flex items-center justify-center">
      <div className="w-full max-w-[500px] h-[600px] bg-white rounded-lg shadow-gray-400 shadow-lg flex flex-col gap-[30px]">
        <div className="w-full h-[200px] bg-[#20c7ff] rounded-b-[30%] shadow-gray-400 shadow-lg flex items-center justify-center">
          <h1 className="text-gray-600 font-bold text-[30px]">
            Welcome To <span className="text-white">Chatly</span>
          </h1>
        </div>

        <form
          className="w-full flex flex-col gap-[20px] justify-center items-center"
          onSubmit={handleSignUp}
        >
          <input
            type="text"
            placeholder="username"
            className="w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-white rounded-lg shadow-gray-400 shadow-lg"
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
          />

          <input
            type="email"
            placeholder="email"
            className="w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-white rounded-lg shadow-gray-400 shadow-lg"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          <div className="w-[90%] h-[50px] border-2 border-[#20c7ff] overflow-hidden rounded-lg shadow-gray-400 shadow-lg relative">
            <input
              type={show ? "text" : "password"}
              placeholder="password"
              className="w-full h-full outline-none px-[20px] py-[10px] bg-white"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <span
              className="absolute top-[10px] right-[20px] text-[19px] text-[#20c7ff] font-semibold cursor-pointer"
              onClick={() => setShow((prev) => !prev)}
            >
              {show ? "hide" : "show"}
            </span>
          </div>
            {err && <p className='text-red-500 font-semibold'>{err}</p>}


          <button className="px-[20px] py-[10px] bg-[#20c7ff] rounded-2xl shadow-gray-400 shadow-lg text-[20px] w-[200px] mt-[20px] font-semibold hover:shadow-inner" disabled={loading}>
           {loading?"Loading...":"Sign up"}
          </button>

          <p className="cursor-pointer" onClick={() => navigate("/login")}>
            Already Have An Account?{" "}
            <span className="text-[#20c7ff] font-bold">Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
