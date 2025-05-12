// announcementSlice.js (注意修正拼写错误)
import { GetAnnouncementAPI, UpdateAnnouncementAPI } from "../../apis/announcementApi";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  content: '',
  announcementId:null,
  loading: false,
  error: null,
};

// 异步获取公告
export const getAnnouncement = createAsyncThunk(
  'announcement/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await GetAnnouncementAPI();
      
      // 统一处理响应格式
      if (response.code !== 1) { // 根据实际接口返回码调整
        return rejectWithValue(response.msg || '获取公告失败');
      }
      
      // 假设返回格式为 { code:1, data: { announcementId: "123", content: "..." } }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
// 异步更新公告
// announcementSlice.js
export const updateAnnouncement = createAsyncThunk(
  'announcement/update',
  async ({ announcementId, content }, { rejectWithValue }) => {
    try {
      console.log('Updating announcement with:', { announcementId, content });
      const response = await UpdateAnnouncementAPI(announcementId, content);
      // 检查 code 是否为 1（成功）
      if (response.code === 1) {
        return {
          // 使用传入的 announcementId 和 content，因为后端返回的 data 为 null
          announcementId,
          content,
          ...(response.data || {}), // 合并可能的 data 字段
        };
      } else {
        throw new Error(response.data.msg || '更新公告失败');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    // 同步设置公告内容
    setContent: (state, action) => {
      state.content = action.payload;
    },
    // 清除错误信息
    clearError: (state) => {
      state.error = null;
    },
    // 重置状态
    reset: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // 获取公告处理
      .addCase(getAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.announcementId = action.payload.announcementId || state.announcementId;
          state.content = action.payload.content || state.content;
        }

      })
      
      .addCase(getAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 更新公告处理
      .addCase(updateAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.announcementId = action.payload.announcementId;
          state.content = action.payload.content;
        }
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setContent, clearError, reset } = announcementSlice.actions;
const announcementReducer = announcementSlice.reducer
export default announcementReducer;