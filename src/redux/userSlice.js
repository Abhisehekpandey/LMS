// userSlice.js

import { createSlice } from "@reduxjs/toolkit";
import {
  createAsyncThunkWithTokenRefresh,
  createAxiosConfig,
} from "./common/commonFunction";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  userInfo: null,
  loading: false,
  error: null,
  createUser: {},
  createUserIsError: false,
  createUserIsSuccess: false,
  createUserError: "",
  createUserIsLoading: false,
};

export const createUserAction = createAsyncThunkWithTokenRefresh(
  "createUserAction/createUser",
  async (token, payload) => {
    const headers = {
      pageNumber: payload.pageNumber || 0,
      pageSize: payload.pageSize || 7,
      username: localStorage.getItem("username"),
    };

    return axios.get(`/crm/api/createUser`, createAxiosConfig(token, headers));
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
    },
    createUserReducer(state) {
        state.createUserIsLoading = false
        state.createUserIsSuccess = false
        state.createUserIsError = false
        state.createUserError = ''
      }
  },

  extraReducers: (builder) => {
    builder
    .addCase(createUserAction.pending, state => {
        state.createUser = {}
        state.createUserIsLoading = true
        state.createUserIsSuccess = false
        state.createUserIsError = false
        state.createUserError = ''
      })
      .addCase(createUserAction.fulfilled, (state, action) => {
        state.createUser = action.payload
        state.createUserIsLoading = false
        state.createUserIsSuccess = true
        state.createUserIsError = false
        state.createUserError = ''
      })
      .addCase(createUserAction.rejected, (state, action) => {
        state.createUser = {}
        state.createUserIsLoading = false
        state.createUserIsSuccess = false
        state.createUserIsError = true
        state.createUserError = action.error.message
        toast(action.error.message, { autoClose: 2000, type: 'error' })
      })
    }
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
