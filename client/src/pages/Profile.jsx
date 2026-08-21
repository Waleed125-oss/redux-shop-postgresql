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
    return <h2>Loading...</h2>;
  }

  return (

    <div className="max-w-2xl mx-auto mt-10">

      <div className="bg-white rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-8">

          My Profile

        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div>

            <label>Name</label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full border rounded p-3"
            />

          </div>

          <div>

            <label>Email</label>

            <input
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border rounded p-3"
            />

          </div>

          <div>

            <label>Role</label>

            <input
              value={profile.role}
              disabled
              className="w-full border rounded p-3 bg-gray-100"
            />

          </div>

          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Save Changes
          </button>

        </form>

      </div>

    </div>

  );

}

export default Profile;