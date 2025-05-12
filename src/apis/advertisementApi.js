import request from "../utils/request"
export function AdvertisementInsertAPI(formData){
  return request({
    url:'/admin/advertisement/insert',
    method:'POST',
    data:formData,
  })
}
export function AdvertisementGetListAPI(params){
  return request({
    url:'/admin/advertisement/list',
    method:'GET',
    params,
  })
}
export function AdvertisementUploadAPI(formData) {
  return request({
    url: '/admin/advertisement/upload',
    method: 'POST',
    data: formData, 
  });
}
export function AdvertisementDeleteAPI(advertisementId){
  return request({
    url:`/admin/advertisement/rm/${advertisementId}`,
    method:'DELETE',
  })
}
export function AdvertisementUpdateAPI(formData){
  return request({
    url:'/admin/advertisement/update',
    method:'POST',
    data:formData
  })
}