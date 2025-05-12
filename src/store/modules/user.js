import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
  name:'user',
  initialState:{
    token: localStorage.getItem('token') || null,
    adminId: null,
    username: '',
    wechatId: '',
    phoneNumber: '',
    qrCodeUrl: ''
  },
  reducers:{
    login: (state, action) => {
      state.token = action.payload.token; 
    },
    logout: (state) => {
      state.token = null; 
    },
  },
  // reducers: {
  //   login: (state, { payload }) => {
  //     state.token = payload.token;
  //     state.adminId = payload.adminId;
  //     state.username = payload.username;
  //     state.wechatId = payload.wechatId;
  //     state.phoneNumber = payload.phoneNumber;
  //     state.qrCodeUrl = payload.qrCodeUrl;
  //     localStorage.setItem('token', payload.token);
  //   },
  //   logout: (state) => {
  //     // 清空所有状态
  //     Object.assign(state, userSlice.getInitialState());
  //     localStorage.removeItem('token');
  //   }
  // }
})
const userReducer = userSlice.reducer
export const { login, logout } = userSlice.actions;
export default userReducer