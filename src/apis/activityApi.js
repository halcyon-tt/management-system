import request from "../utils/request";
export function uploadActivityAPI(formData) {
  return request({
    url: '/admin/activity/upload',
    method: 'POST',
    data: formData,
  });
}
export function getActivityAPI(params){
  return request({
    url:'/admin/activity/get-list',
    method:'GET',
    params,
  })
  }
  export function createActivityAPI(formData){
    return request({
      url:'/admin/activity/create',
      method:'POST',
      headers: {
        'Content-Type': 'application/json', // 确保请求头正确
      },
      data: JSON.stringify(formData), // 确保请求体是 JSON 格式
    })
  }
  export function searchActivityAPI(params) {
    return request({
      url: '/admin/activity/search',
      method: 'POST', 
      data:params,
    });
  }
  export function updateActivityAPI(params) {
    const transformedParams = {
      activityId: params.activityId,
      activityName: params.activityName,
      condition: params.condition,
      iconUrl: params.iconUrl,  
      posterUrl: params.posterUrl, 
      beginTime: params.beginTime,
      endTime: params.endTime,
      status: params.status
    };
  
    return request({
      url: '/admin/activity/update',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: transformedParams,
    });
  }
export function takeDawnActivityAPI(activityId) {
  return request({
    url: `/admin/activity/takedown/${activityId}`,
    method: 'POST',
    data: { status: 0 }, 
  });
}