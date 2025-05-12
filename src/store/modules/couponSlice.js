import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  CouponIssueAPI,
  CouponGetListAPI,
  CouponUpdateAPI,
  CouponDeleteAPI,
} from '../../apis/couponApi'; 

// 初始状态
const initialState = {
  couponList: [], // 优惠券列表
  loading: false, // 加载状态
  error: null, // 错误信息
  currentCoupon: null, // 当前操作的优惠券
};

// 异步获取优惠券列表
export const fetchCoupons = createAsyncThunk(
  'coupon/fetchList',
  async (activityId, { rejectWithValue }) => { // 接收activityId参数
    try {
      const response = await CouponGetListAPI(activityId);
      return response.data||[];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 发放优惠券
export const issueCoupon = createAsyncThunk(
  'coupon/issue',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await CouponIssueAPI(payload);
      if (response.code !== 1) {
        throw new Error(response.msg || '发放优惠券失败');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// 异步 更新优惠券
export const updateCoupon = createAsyncThunk(
  'coupon/update',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await CouponUpdateAPI(formData);
      return response.data; // 返回接口数据
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 删除优惠券
export const deleteCoupon = createAsyncThunk(
  'coupon/delete',
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await CouponDeleteAPI(couponId);
      return { couponId, data: response.data }; // 返回优惠券ID和接口数据
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 创建 Slice
const CouponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    // 同步 设置当前操作的优惠券
    setCurrentCoupon: (state, action) => {
      state.currentCoupon = action.payload;
    },
    // 同步 重置错误信息
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取优惠券列表
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.couponList = []; 
      })
      // 在Redux slice处理响应数据
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.couponList = action.payload.map(item => ({
          couponId: item.couponId,
          title: item.title, 
          originalPrice: item.actualValue, // 原价对应实际支付
          discountPrice: item.payValue,    // 折扣价对应券后价
          totalCount: item.initialQuantity,
          remainingCount: item.stock, 
          beginTime: item.beginTime,
          endTime: item.endTime,
          posterUrl: item.posterUrl,
          iconUrl: item.iconUrl,
          condition: item.condition,
          detail: item.detail,
        }));
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 发放优惠券
      .addCase(issueCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(issueCoupon.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(issueCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 更新优惠券
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 删除优惠券
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.couponList = state.couponList.filter(
          (coupon) => coupon.id !== action.payload.couponId
        );
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 导出同步 Action
export const { setCurrentCoupon, clearError } = CouponSlice.actions;
const couponReducer = CouponSlice.reducer
// 导出 Reducer
export default couponReducer;