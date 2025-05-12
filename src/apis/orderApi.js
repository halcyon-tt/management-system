import request from "../utils/request"

export function getOrderAPI (params){
  
  return request({
    url:'/admin/order/data/statistics',
    method:'POST',
    data:params,
    headers: {
      'Content-Type': 'application/json', 
    },
  })
}
export function dataExportAPI(params) {
  return request({
    url: '/admin/order/data/statistics/export',
    method: 'POST',
    params: { // 按照接口文档要求通过Query传递参数
      beginTime: params.beginTime || '',
      endTime: params.endTime || ''
    },
    responseType: 'blob',
    timeout: 30000
  })
}
export function getOrderListAPI(params){
  return request({
    url:'/admin/order/list',
    method:'GET',
    params: {  // 使用params而不是data，因为GET请求参数应该在URL中
      beginTime: params.beginTime || '',
      endTime: params.endTime || '',
      transactionCode: params.transactionCode || ''
    }
  })
}
export function searchOrderAPI(transactionCode){
  return request({
    url:'/admin/order/by-code',
    method:'GET',
    params: transactionCode
  })
}