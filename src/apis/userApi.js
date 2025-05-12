import request from "../utils/request";
export function userFeelBackSolver(feedbackId, status) {
  return request({
    url: `/admin/user-feedback/solved/${feedbackId}`,
    method: 'POST',
    data: { status:status }
  });
}
export function userFeelBack(formdata){
  return request({
    url:'/admin/user-feedback/list',
    method:'GET',
    data:formdata,
    })
}
export function userFeelBackDeleteAPI(feedbackId){
  return request({
    url:`/admin/user-feedback/delete/${feedbackId}`,
    method:'DELETE',
  })
}