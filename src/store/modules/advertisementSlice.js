import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  AdvertisementInsertAPI,
  AdvertisementUpdateAPI,
  AdvertisementDeleteAPI,
  AdvertisementGetListAPI,
  AdvertisementUploadAPI,
} from '../../apis/advertisementApi';

// 初始状态
const initialState = {
  advertisements: [], // 广告列表
  fetchLoading: false,  // 单独列表加载状态
  uploadLoading: false, // 单独上传状态
  error: null, // 错误信息
};

// 异步操作：获取广告列表
export const fetchAdvertisements = createAsyncThunk(
  'advertisement/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AdvertisementGetListAPI();
      console.log(response)
      // 添加数据校验
      const validatedData = response.data.map(item => ({
        advertisementId: item.advertisementId || 0,
        imageUrl: item.imageUrl || '',
        type: item.type || 'image' // 默认值处理
      }));
      
      return validatedData;
    } catch (error) {
      if(error.message === 'Network Error')
        return rejectWithValue('账号已在别处登录，请返回重新登录');
      return rejectWithValue(error.message);
    }
  }
);
// 异步操作：新增广告
export const insertAdvertisement = createAsyncThunk(
  'advertisement/insert',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await AdvertisementInsertAPI(formData);
      return response.data; // 返回接口数据
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步操作：更新广告
export const updateAdvertisement = createAsyncThunk(
  'advertisement/update',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await AdvertisementUpdateAPI(formData);
      return response.data; // 返回接口数据
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步操作：删除广告
export const deleteAdvertisement = createAsyncThunk(
  'advertisement/delete',
  async (advertisementId, { rejectWithValue }) => {
    try {
      const response = await AdvertisementDeleteAPI(advertisementId);
      return { advertisementId, data: response.data }; // 返回广告ID和接口数据
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步操作：上传广告
export const uploadAdvertisement = createAsyncThunk(
  'advertisement/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await AdvertisementUploadAPI(formData);
      console.log(response);
      
      return response.data; // 返回接口数据
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 创建 Slice
const AdvertisementSlice = createSlice({
  name: 'advertisement',
  initialState,
  reducers: {
    // 同步操作：重置广告列表
    resetAdvertisements: (state) => {
      state.advertisements = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取广告列表
      .addCase(fetchAdvertisements.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchAdvertisements.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.advertisements = action.payload.map(item => ({
          ...item,
          type: item.type === 'video' ? 'video' : 'image' // 统一类型标识
        }));
      })
      
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 新增广告
      .addCase(insertAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(insertAdvertisement.fulfilled, (state, action) => {
        state.loading = false;
        state.advertisements.push(action.payload); // 将新增广告添加到列表
      })
      .addCase(insertAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 更新广告
      .addCase(updateAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdvertisement.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAd = action.payload;
        state.advertisements = state.advertisements.map((ad) =>
          ad.id === updatedAd.id ? updatedAd : ad
        ); // 更新广告列表
      })
      .addCase(updateAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 删除广告
      .addCase(deleteAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdvertisement.fulfilled, (state, action) => {
        state.loading = false;
        state.advertisements = state.advertisements.filter(
          (ad) => ad.id !== action.payload.advertisementId
        ); // 从列表中移除广告
      })
      .addCase(deleteAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 上传广告
      .addCase(uploadAdvertisement.pending, (state) => {
        state.uploadLoading = true;
      })
      .addCase(uploadAdvertisement.fulfilled, (state) => {
        state.uploadLoading = false;
      })
      .addCase(uploadAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 导出同步 Action
export const { resetAdvertisements } = AdvertisementSlice.actions;

const advertisementReducer = AdvertisementSlice.reducer;
// 导出 Reducer
export default advertisementReducer;