import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd'; 
import zhCN from 'antd/locale/zh_CN';
import router from './router';
import store from './store/index'
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; 
dayjs.locale('zh-cn'); 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
       <ConfigProvider locale={zhCN}> 
      <RouterProvider router={router} />
    </ConfigProvider>
    </Provider>
    
);
