import { createAsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { userFeelBack, userFeelBackSolver,userFeelBackDeleteAPI } from '../../apis/userApi';

const initialState = {
  feedbackList: [],
  loading: false,
  error: null
};
export const deleteFeedback = createAsyncThunk(
  'feedback/delete',
  async (feedbackId, { rejectWithValue }) => {
    try {
      await userFeelBackDeleteAPI(feedbackId);
      return feedbackId; // 直接返回被删除的ID
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(deleteFeedback.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteFeedback.fulfilled, (state, action) => {
      state.loading = false;
      state.feedbackList = state.feedbackList.filter(
        f => f.feedbackId !== action.payload 
      );
    })
    .addCase(deleteFeedback.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
      .addCase(fetchFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbackList = action.payload;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleStatus.fulfilled, (state, action) => {
        const { feedbackId, newStatus } = action.payload;
        const target = state.feedbackList.find(f => f.id === feedbackId);
        if (target) {
          target.status = newStatus;
        }
      })
  }
});

// 获取反馈列表
export const fetchFeedback = createAsyncThunk(
  'feedback/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userFeelBack(params);
      return response.data; // 返回接口数据
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 更新反馈状态
export const toggleStatus = createAsyncThunk(
  'feedback/toggleStatus',
  async ({ feedbackId, newStatus }, { rejectWithValue }) => {
    try {
      const numericId = Number(feedbackId);
      await userFeelBackSolver(numericId, newStatus);
      return { 
        feedbackId: numericId,
        newStatus // 直接使用传入值
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const feedbackReducer = feedbackSlice.reducer
export default feedbackReducer