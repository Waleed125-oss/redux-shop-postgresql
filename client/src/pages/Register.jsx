// import { Link } from "react-router-dom";
// import { useState } from "react";

// function Register() {

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log({
//       name,
//       email,
//       password,
//     });
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">

//       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

//         <h1 className="text-3xl font-bold text-center mb-6">
//           Register
//         </h1>

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-4"
//         >

//           <input
//             type="text"
//             placeholder="Full Name"
//             className="w-full border p-3 rounded-lg"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />

//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full border p-3 rounded-lg"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full border p-3 rounded-lg"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />

//           <button
//             className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
//           >
//             Create Account
//           </button>

//         </form>

//         <p className="text-center mt-5">

//           Already have an account?

//           <Link
//             to="/login"
//             className="text-blue-600 ml-2"
//           >
//             Login
//           </Link>

//         </p>

//       </div>

//     </div>
//   );
// }

// export default Register;