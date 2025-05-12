import { createSlice ,createAsyncThunk} from '@reduxjs/toolkit';
import { createActivityAPI,
  getActivityAPI,
  searchActivityAPI,
  updateActivityAPI,
  uploadActivityAPI,
  takeDawnActivityAPI } from '../../apis/activityApi';
  export const fetchActivities = createAsyncThunk(
    'activity/fetchActivities',
    async (params, { rejectWithValue }) => {
      try {
        const response = await getActivityAPI(params);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 创建活动
  export const addNewActivity = createAsyncThunk(
    'activity/addNewActivity',
    async (formData, { rejectWithValue }) => {
      try {
        const response = await createActivityAPI(formData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 上传文件
  export const uploadActivityFile = createAsyncThunk(
    'activity/uploadActivityFile',
    async (formData, { rejectWithValue }) => {
      try {
        const response = await uploadActivityAPI(formData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 搜索活动
  export const searchActivities = createAsyncThunk(
    'activity/searchActivities',
    async (params, { rejectWithValue }) => {
      try {
        const response = await searchActivityAPI(params);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 更新活动信息
  export const updateActivity = createAsyncThunk(
    'activity/updateActivity',
    async (params, { rejectWithValue }) => {
      try {
        const response = await updateActivityAPI(params);
        return response;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 下架活动
  export const removeActivity = createAsyncThunk(
    'activity/removeActivity',
    async (activityId, { rejectWithValue }) => {
      try {
        const response = await takeDawnActivityAPI(activityId); 
        return response;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  const initialState = {
    activities: [], // 活动列表
    loading: false, // 加载状态
    error: null, // 错误信息
   
  };
  
  const activitySlice = createSlice({
    name: 'activity',
    initialState,
    reducers: {
      resetActivities: (state) => {
        state.activities = [];
        state.loading = false;
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      // 获取活动列表
      builder
        .addCase(fetchActivities.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchActivities.fulfilled, (state, action) => {
          state.loading = false;
          state.activities = action.payload;
        })
        .addCase(fetchActivities.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
  
      // 创建活动
      builder
        .addCase(addNewActivity.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(addNewActivity.fulfilled, (state, action) => {
          state.loading = false;
          state.activities.push(action.payload);
        })
        .addCase(addNewActivity.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
  
      // 上传文件
      builder
        .addCase(uploadActivityFile.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(uploadActivityFile.fulfilled, (state, action) => {
          state.loading = false;
          // 处理上传成功后的逻辑
        })
        .addCase(uploadActivityFile.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
  
      // 搜索活动
      builder
        .addCase(searchActivities.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(searchActivities.fulfilled, (state, action) => {
          state.loading = false;
          state.activities = action.payload.map(item => ({
            ...item,
            beginTime: item.beginTime || '',
            endTime: item.endTime || '',
            posterUrl: item.posterUrl || '',
            iconUrl: item.iconUrl || ''
          }));
        })
        .addCase(searchActivities.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
  
      // 更新活动信息
      builder
        .addCase(updateActivity.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateActivity.fulfilled, (state, action) => {
          state.loading = false;
          const index = state.activities.findIndex(
            (activity) => activity.activityId === action.payload.activityId
          );
          if (index !== -1) {
            state.activities[index] = {
              ...state.activities[index],
              ...action.payload,
            }
          }
        })
        .addCase(updateActivity.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
  
      // 下架活动
      builder
    .addCase(removeActivity.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(removeActivity.fulfilled, (state, action) => {
      state.loading = false;
      // 检查 action.payload 是否存在且包含 code 字段
      if (action.payload && action.payload.code === 1) {
        // 找到对应的活动并更新其状态为 0
        const index = state.activities.findIndex(
          (activity) => activity.activityId === action.meta.arg
        );
        if (index !== -1) {
          state.activities[index].status = 0; // 更新状态为 0
        }
      }
    })
    .addCase(removeActivity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    },
  });
export const { resetActivities } = activitySlice.actions;
const activityReducer = activitySlice.reducer
export default activityReducer;