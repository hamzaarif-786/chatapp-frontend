import { useNavigate } from 'react-router-dom';
import React, { useState } from "react";
import axios from 'axios';
import { serverUrl } from '../main';
import { useDispatch,  } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  let dispatch=useDispatch()
  

  

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);   // start loading
    setErr("");         // reset previous error

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data))
      navigate("/")
      setEmail("");
      setPassword("");
      setLoading(false);
      setErr("")
      // optionally show success message
    
      navigate("/"); // redirect to home/dashboard
    } catch (error) {
      console.log(error.response?.data?.message);
      setErr(error.response?.data?.message || "Login failed"); // show error in form
      setLoading(false);
    }
  };

  return (
    <div className='w-full h-[100vh] bg-slate-200 flex items-center justify-center'>
      <div className='w-full max-w-[500px] h-[600px] bg-white rounded-lg shadow-gray-400 shadow-lg flex flex-col gap-[30px]'>
        <div className='w-full h-[200px] bg-[#20c7ff] rounded-b-[30%] shadow-gray-400 shadow-lg flex items-center justify-center'>
          <h1 className='text-gray-600 font-bold text-[30px]'>
            Login To <span className="text-white">Chatly</span>
          </h1>
        </div>

        <form className='w-full flex flex-col gap-[20px] justify-center items-center' onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className='w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-white rounded-lg shadow-gray-400 shadow-lg'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />

          <div className='w-[90%] h-[50px] border-2 border-[#20c7ff] overflow-hidden rounded-lg shadow-gray-400 shadow-lg relative'>
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              className='w-full h-full outline-none px-[20px] py-[10px] bg-white'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <span
              className='absolute top-[10px] right-[20px] text-[19px] text-[#20c7ff] font-semibold cursor-pointer'
              onClick={() => setShow(prev => !prev)}
            >
              {show ? "Hide" : "Show"}
            </span>
          </div>

          {err && <p className='text-red-500 font-semibold'>{err}</p>}

          <button
            type="submit"
            className='px-[20px] py-[10px] bg-[#20c7ff] rounded-2xl shadow-gray-400 shadow-lg text-[20px] w-[200px] mt-[20px] font-semibold hover:shadow-inner'
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>

          <p className='cursor-pointer' onClick={() => navigate("/signup")}>
            Want To Create an Account? <span className='text-[#20c7ff] font-bold'>SignUp</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
