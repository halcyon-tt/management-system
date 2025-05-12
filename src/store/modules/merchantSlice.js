// merchantSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  MerchantReginsterAPI,
  GetMerchantListAPI,
  DeleteMerchantAPI,
  UpadateMerchant
} from '../../apis/merchant';
const initialState = {
  merchantList: [],
  loading: false,
  error: null,
  currentMerchant: null
};

// 异步thunks
export const registerMerchant = createAsyncThunk(
  'merchant/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await MerchantReginsterAPI(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMerchantList = createAsyncThunk(
  'merchant/fetchList',
  async (params = {}, { rejectWithValue }) => { 
    try {
      console.log('实际请求参数:', params);
      const response = await GetMerchantListAPI(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const deleteMerchant = createAsyncThunk(
  'merchant/delete',
  async (merchantId, { rejectWithValue }) => {
    try {
      await DeleteMerchantAPI(merchantId);
      return merchantId; // 返回被删除的ID用于更新状态
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMerchant = createAsyncThunk(
  'merchant/update',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await UpadateMerchant(formData);
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('服务器返回无效数据');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const merchantSlice = createSlice({
  name: 'merchant',
  initialState,
  reducers: {
    setCurrentMerchant: (state, action) => {
      state.currentMerchant = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 注册商户
      .addCase(registerMerchant.fulfilled, (state, action) => {
        state.loading = false;
        
        // 防御性检查：确保 payload 有效
        if (!action.payload) return;
      
        // 合并字段并设置默认值
        const newMerchant = {
          ...action.payload, // 展开原始字段
          storeName: action.payload.storeName ?? '新店铺', // 正确访问字段
          storeAddress: action.payload.storeAddress ?? '地址待填写'
        };
      
        // 更新状态
        state.merchantList = [...state.merchantList, newMerchant];
      })
      // 获取商户列表
      .addCase(fetchMerchantList.fulfilled, (state, action) => {
        state.loading = false;
        
        // 添加数据校验和过滤
        state.merchantList = (action.payload || []) // 防止 payload 本身为 null/undefined
          .filter(item => !!item) // 过滤掉 null/undefined 的条目
          .map(item => ({
            merchantId: item.merchantId || '未知ID', // 处理可能缺失的字段
            merchantName: item.merchantName || '未命名商家',
            phoneNumber: item.phoneNumber || '暂无联系方式',
            storeName: item.storeName || '默认店铺', 
            storeAddress: item.storeAddress || '地址待填写',
            idCard:item.idCard,
            password:item.password,
            username:item.username
          }));
      })
  
      // 删除商户
      .addCase(deleteMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.merchantList = state.merchantList.filter(
          merchant => merchant.merchantId !== action.payload
        );
      })

      // 更新商户
      .addCase(updateMerchant.fulfilled, (state, action) => {
        state.loading = false;
        
        // 确保 payload 有效
        if (!action.payload || !action.payload.merchantId) {
          state.error = '更新失败：无效的响应数据';
          return;
        }
      
        // 更新本地数据
        const index = state.merchantList.findIndex(
          item => item.merchantId === action.payload.merchantId
        );
        
        if (index !== -1) {
          state.merchantList[index] = {
            ...state.merchantList[index],
            ...action.payload
          };
        }
      })
      // 统一处理loading状态
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || 
                   action.type.endsWith('/rejected'),
        (state) => {
          state.loading = false; 
        }
      )
  }
});

// 导出actions和reducer
export const { setCurrentMerchant, clearError } = merchantSlice.actions;
const merchantReducer = merchantSlice.reducer
export default merchantReducer;