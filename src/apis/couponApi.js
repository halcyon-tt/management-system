import request from "../utils/request";

export function CouponIssueAPI(formData) {
  return request({
    url: '/admin/coupon/issue',
    method: 'POST',
    data: {
      title: formData.title,
      condition: formData.condition,
      payValue: Number(formData.payValue),
      actualValue: Number(formData.actualValue),
      stock: Number(formData.stock),
      activityName: formData.activityName,
      storeName: formData.storeName,
      initialQuantity: Number(formData.initialQuantity),
      posterUrl: formData.posterUrl,
      iconUrl: formData.iconUrl,
      detail: formData.detail,
      activityId:formData.activityId,
    }
  });
}

export function CouponGetListAPI(activityId) {
  return request({
    url: `/admin/coupon/list/${activityId}`,
    method: 'GET'
  })
}
export function CouponUpdateAPI(formData){
  return request({
    url:'/admin/coupon/update',
    method:'POST',
    data:formData
  })
}
export function CouponDeleteAPI(couponId){
  return request({
    url:`/admin/coupon/rm/${couponId}`,
    method:'DELETE',
  })
}