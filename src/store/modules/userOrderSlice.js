// orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrderListAPI, searchOrderAPI } from '../../apis/orderApi';

// 通用的异步请求处理函数
const handleAsyncRequest = async (apiMethod, params) => {
  try {
    const response = await apiMethod(params);
    if (response.code === 1) {
      return {
        data: response.data,
        receivedAt: Date.now()
      };
    }
    throw new Error(response.msg || '请求失败');
  } catch (error) {
    throw new Error(error.message);
  }
};

// 获取订单列表
export const fetchOrderList = createAsyncThunk(
  'order/fetchOrderList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await handleAsyncRequest(getOrderListAPI, params);
      return result;
    } catch (error) {
      if(error.message === 'Network Error')
        return rejectWithValue('账号已在别处登录，请返回重新登录');
      return rejectWithValue(error.message);
    }
  }
);

// 搜索功能单
export const searchOrder = createAsyncThunk(
  'order/search',
  async (params, { rejectWithValue }) => {
    try {
      // 确保API调用参数正确
      const response = await searchOrderAPI({ 
        transactionCode: params.transactionCode,
        beginTime: params.beginTime,
        endTime: params.endTime
      });
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'uesrOrder',
  initialState: {
    data: [], 
    loading: false,
    error: null
  },
  reducers: {
    clearOrderList: (state) => {
      state.data = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderList.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.lastUpdated = action.payload.receivedAt;
      })
      .addCase(fetchOrderList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchOrder.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchOrder.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(searchOrder.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      });
  },
});

export const { clearOrderList } = orderSlice.actions;
const userOrderReducer = orderSlice.reducer
export default userOrderReducer;