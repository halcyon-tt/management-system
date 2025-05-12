import { configureStore } from '@reduxjs/toolkit';
import userReducer from './modules/user';
import orderReducer from './modules/orderSlice'
import activityReducer from './modules/activitySlice'
import feedbackReducer from './modules/feedbackSlice';
import advertisementReducer from './modules/advertisementSlice';
import announcementReducer from './modules/annoucementSlice';
import couponReducer from './modules/couponSlice';
import merchantReducer from './modules/merchantSlice';
import { getToken } from '../utils';
import userOrderReducer from './modules/userOrderSlice';
const preloadedState = {
  user: {
    token: getToken() || null // 初始状态从 sessionStorage 读取
  }
}
const store = configureStore({
  preloadedState ,
  reducer: {
    user:userReducer,
    order:orderReducer,
    activity: activityReducer,
    feedback:feedbackReducer,
    advertisement:advertisementReducer,
    announcement:announcementReducer,
    coupon:couponReducer,
    merchant:merchantReducer,
    userOrder:userOrderReducer
  },
});

export default store;