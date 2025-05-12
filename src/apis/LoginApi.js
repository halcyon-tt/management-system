
import  request  from '../utils/request';

export function loginAPI(formData) {
  return request({
    url: '/admin/login',
    method: 'POST',
    data: formData,
  });
  
  // 模拟登录接口
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({
  //       code: 1,
  //       msg: null,
  //       data: {
  //         token: 'mock-token',
  //         adminId: 1,
  //         username: formData.username,
  //         password:123456,
  //         wechatId: 'mock-wechat-id',
  //         phoneNumber: '1234567890',
  //         qrCodeUrl: 'https://example.com/qrcode.png',
  //       },
  //     });
  //   }, 1000); // 模拟 1 秒延迟
  // });

}
