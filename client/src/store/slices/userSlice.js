import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProfileAPI, updateProfileAPI, } from "../../services/userApi";

export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async () => {
    return await getProfileAPI();
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData) => {
    return await updateProfileAPI(userData);
  }
);

const userSlice = createSlice({
  name: "user",

  initialState: {
    profile: null,
    loading: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })

      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false;
      })
      
      .addCase(updateProfile.fulfilled, (state, action) => {

  state.profile = action.payload.user;

  localStorage.setItem(
    "user",
    JSON.stringify(action.payload.user)
  );

});
      
  },
});

export default userSlice.reducer;