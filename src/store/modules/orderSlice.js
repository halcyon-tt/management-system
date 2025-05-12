// orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrderAPI,dataExportAPI } from '../../apis/orderApi';

export const fetchOrderStatistics = createAsyncThunk(
  'order/fetchOrderStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getOrderAPI(params);
      if (response.code === 1) {
        return {
          data: response.data,
          receivedAt: Date.now()
        };
      }
      return rejectWithValue(response.msg);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const exportOrderStatistics = createAsyncThunk(
  'order/exportStatistics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dataExportAPI(params);
      
      // 验证二进制数据有效性
      if (!(response.data instanceof Blob)) {
        throw new Error('无效的响应格式');
      }

      // 解析文件名（后端需返回Content-Disposition头）
      const contentDisposition = response.headers['content-disposition'] || '';
      const filename = contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'export.xlsx';

      return {
        blob: response.data,
        filename: decodeURIComponent(filename) // 解码中文
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orderStatistics: null,
    loading: false,
    error: null,
    lastUpdated: null,
    exportLoading: false,
    exportError: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.orderStatistics = action.payload;
        state.lastUpdated = action.payload.receivedAt;
      })
      .addCase(fetchOrderStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orderStatistics = null;
      })
      .addCase(exportOrderStatistics.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportOrderStatistics.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportOrderStatistics.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      });
  },
});
export const { resetExportState } = orderSlice.actions;
const orderReducer = orderSlice.reducer
export default orderReducer;