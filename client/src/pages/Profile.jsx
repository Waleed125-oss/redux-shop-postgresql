// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";

// import {
//   fetchProfile,
//   updateProfile,
// } from "../store/slices/userSlice";

// function Profile() {

//   const dispatch = useDispatch();

//   const { profile, loading } = useSelector(
//     (state) => state.user
//   );

//   const [name, setName] = useState("");

//   const [email, setEmail] = useState("");

//   useEffect(() => {
//     dispatch(fetchProfile());
//   }, [dispatch]);

//   useEffect(() => {

//     if (profile) {
//       setName(profile.name);
//       setEmail(profile.email);
//     }

//   }, [profile]);

//   const handleSubmit = async (e) => {

//     e.preventDefault();

//     await dispatch(
//   updateProfile({
//     name,
//     email,
//   })
// ).unwrap();

// alert("Profile Updated Successfully");

//   };

//   if (loading || !profile) {
//     return <h2>Loading...</h2>;
//   }

//   return (

//     <div className="max-w-2xl mx-auto mt-10">

//       <div className="bg-white rounded-xl shadow p-8">

//         <h1 className="text-3xl font-bold mb-8">

//           My Profile

//         </h1>

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-6"
//         >

//           <div>

//             <label>Name</label>

//             <input
//               value={name}
//               onChange={(e) =>
//                 setName(e.target.value)
//               }
//               className="w-full border rounded p-3"
//             />

//           </div>

//           <div>

//             <label>Email</label>

//             <input
//               value={email}
//               onChange={(e) =>
//                 setEmail(e.target.value)
//               }
//               className="w-full border rounded p-3"
//             />

//           </div>

//           <div>

//             <label>Role</label>

//             <input
//               value={profile.role}
//               disabled
//               className="w-full border rounded p-3 bg-gray-100"
//             />

//           </div>

//           <button
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg"
//           >
//             Save Changes
//           </button>

//         </form>

//       </div>

//     </div>

//   );

// }

// export default Profile;











import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchProfile,
  updateProfile,
} from "../store/slices/userSlice";

function Profile() {

  const dispatch = useDispatch();

  const { profile, loading } = useSelector(
    (state) => state.user
  );

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {

    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }

  }, [profile]);

  const handleSubmit = async (e) => {

    e.preventDefault();

    await dispatch(
  updateProfile({
    name,
    email,
  })
).unwrap();

alert("Profile Updated Successfully");

  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
          <h2 className="text-slate-500 font-medium">Loading...</h2>
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold border-2 border-white/40">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  My Profile
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Manage your personal information
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-8 py-8 space-y-6"
          >

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Name
              </label>
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role
              </label>
              <input
                value={profile.role}
                disabled
                className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-sm shadow-blue-600/30 transition-colors"
            >
              Save Changes
            </button>

          </form>

        </div>

      </div>
    </div>

  );

}

export default Profile;
