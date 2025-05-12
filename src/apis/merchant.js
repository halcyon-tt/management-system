import request from "../utils/request"
export function MerchantReginsterAPI(formData){
  return request({
    url:'/admin/issue-merchant-account',
    method:'POST',
    data:formData,
  })
}
export function GetMerchantListAPI(params) {
  return request({
    url: '/admin/issue-merchant-account/list',
    method: 'GET',
    params,
    timeout: 10000 
  });
}
export function DeleteMerchantAPI(merchantId){
  return request({
    url:`/admin/issue-merchant-account/${merchantId}`,
    method:'DELETE',
  })
}
export function UpadateMerchant(formData) {
  return request({
    url: '/admin/issue-merchant-account/update',
    method: 'POST',
    data: {
      ...formData,
      // 确保字段名与后端一致
      storeName: formData.storeName,
      storeAddress: formData.storeAddress
    }
  });
}