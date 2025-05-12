import request from "../utils/request"

export function GetAnnouncementAPI(){
  return request({
    url:'/admin/announcement/get',
    method:'GET',
})
}
export function UpdateAnnouncementAPI(announcementId, content) {
  return request({
    url: '/admin/announcement/update',
    method: 'POST',
    data: { announcementId, content },
  }).then(response => {
    return {
      code: response.code,    
      msg: response.msg,
      data: response.data || null,
    };
  });
}