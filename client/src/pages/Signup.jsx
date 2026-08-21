import { useState } from "react";
import { registerAPI } from "../services/authApi";
import { useNavigate, Link } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:"",
    email:"",
    password:"",
  });

  const handleChange=(e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value,
    });
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();

    try{

      await registerAPI(form);

      alert("Registration Successful");

      navigate("/login");

    }catch(error){

      alert(
        error.response?.data?.message ||
        "Registration Failed"
      );

    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-blue-600">
            ReduxShop
          </h1>

          <p className="text-gray-500 mt-2">
            Create Your Account 🚀
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="text-sm text-gray-600">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full mt-2 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />

          </div>

          <div>

            <label className="text-sm text-gray-600">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full mt-2 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />

          </div>

          <div>

            <label className="text-sm text-gray-600">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full mt-2 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />

          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-semibold"
          >
            Create Account
          </button>

        </form>

        <p className="text-center mt-6 text-gray-500">

          Already have an account?

          <Link
            to="/login"
            className="text-blue-600 font-semibold ml-2"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  );
}

export default Signup;