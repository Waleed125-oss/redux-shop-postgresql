import { fetchCart } from "./cartSlice";
import { updateProfile } from "./userSlice";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clearCart } from "./cartSlice";

import {
  loginAPI,
  registerAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
} from "../../services/authApi";

export const login = createAsyncThunk(
  "auth/login",
  async (userData, {dispatch }) => {

    const result = await loginAPI(userData);

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));

    dispatch(fetchCart());
    return result;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData) => {
    return await registerAPI(userData);
  }
);


export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email) => {
    return await forgotPasswordAPI(email);
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }) => {
    return await resetPasswordAPI(
      token,
      password
    );
  }
);


const initialState = {

  user:JSON.parse(localStorage.getItem("user")) || null,

  token: localStorage.getItem("token") || null,

  loading: false,

  error: null,

};

const authSlice = createSlice({

  name: "auth",

  initialState,

  reducers: {

    logout: (state) => {

      state.user = null;

      state.token = null;

      localStorage.removeItem("token");

      localStorage.removeItem("user");

    },

  },

  extraReducers: (builder) => {

  builder

    .addCase(login.pending, (state) => {

      state.loading = true;

    })

    .addCase(login.fulfilled, (state, action) => {

      state.loading = false;

      state.user = action.payload.user;

      state.token = action.payload.token;

      localStorage.setItem(
        "token",
        action.payload.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(action.payload.user)
      );

    })

    .addCase(login.rejected, (state, action) => {

      state.loading = false;

      state.error = action.error.message;

    })

    .addCase(updateProfile.fulfilled, (state, action) => {

      state.user = action.payload.user;

      localStorage.setItem(
        "user",
        JSON.stringify(action.payload.user)
      );

    })


    // forgot password
    
   .addCase(forgotPassword.pending, (state) => {
  state.loading = true;
  state.error = null;
})

.addCase(forgotPassword.fulfilled, (state) => {
  state.loading = false;
})

.addCase(forgotPassword.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message;
})


// Reset password 
.addCase(resetPassword.pending, (state) => {
  state.loading = true;
  state.error = null;
})

.addCase(resetPassword.fulfilled, (state) => {
  state.loading = false;
})

.addCase(resetPassword.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message;
});
    

},

});

export const { logout } = authSlice.actions;

export default authSlice.reducer;