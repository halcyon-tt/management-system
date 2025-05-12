import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Input, Upload, Button, message, Form, DatePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { addNewActivity, uploadActivityFile } from '../../store/modules/activitySlice';
import moment from 'moment';
import './index.scss';
import '@ant-design/v5-patch-for-react-19';

const { RangePicker } = DatePicker;
const PHONE_REGEX = /^1[3-9]\d{9}$/; // 手机号正则验证
const STORE_NAME_MAX_LENGTH = 50; // 店铺名称最大长度
const STORE_NAME_REGEX = /[^\u4e00-\u9fa5a-zA-Z0-9（）()《》【】\-—_—·&@#%￥$€£¥§©®™℠•,，。？！：；‘’“”'"/\\[\]{}()<>+=±×÷^~|¦\s]/g;

const ActivityManager = () => {
  const dispatch = useDispatch();
  const [posterFileList, setPosterFileList] = useState([]); // 海报专用
  const [iconFileList, setIconFileList] = useState([]); // 图标专用

  const [currentActivity, setCurrentActivity] = useState({
    activityId: 0, // 活动ID
    activityName: '', // 活动名称
    poster: '', // 海报/视频 URL
    status: null, // 活动状态：1 进行中，0 已结束
    beginTime: '', // 活动开始时间
    endTime: '', // 活动结束时间
    phoneNumber: '', // 关联商家电话
    storeName: '', // 关联店铺名称
    iconUrl: '', // 活动图标 URL
  });
  const [hackValue, setHackValue] = useState(null);
  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };
  const calculateStatus = (beginTime, endTime) => {
    const now = moment();
    const start = moment(beginTime);
    const end = moment(endTime);
    
    if (!start.isValid() || !end.isValid()) return -1;
    if (now.isBefore(start)) return -1;
    if (now.isAfter(end)) return 0;
    return 1;
  };
  const handleTimeChange = (dates, dateStrings) => {
    if (dates) {
      const [beginTime, endTime] = dateStrings;
      const newStatus = calculateStatus(beginTime, endTime);
      
      setCurrentActivity(prev => ({
        ...prev,
        beginTime,
        endTime,
        status: newStatus
      }));
    } else {
      setCurrentActivity(prev => ({
        ...prev,
        beginTime: '',
        endTime: '',
        status: null
      }));
    }
  };

  const handleStoreNameChange = (e) => {
    const rawValue = e.target.value;
    
    let filteredValue = rawValue;
    
    if (!e.nativeEvent.isComposing) {
      filteredValue = rawValue
        .replace(STORE_NAME_REGEX, '')
        .slice(0, STORE_NAME_MAX_LENGTH);
    }
  
    setCurrentActivity(prev => ({
      ...prev,
      storeName: filteredValue
    }));
  };

  const checkVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        if (video.duration > 5) {
          reject('视频长度不能超过 5 秒！');
        } else {
          resolve();
        }
      };
    });
  };

  const validateForm = () => {
    const requiredFields = [
      'activityName',
      'beginTime',
      'endTime',
      'phoneNumber',
      'storeName',
      'poster',
      'iconUrl',
      'status',
    ];
    
    if (requiredFields.some(field => !currentActivity[field])) {
      message.error('请填写所有必填字段！');
      return false;
    }

    if (!PHONE_REGEX.test(currentActivity.phoneNumber)) {
      message.error('请输入有效的手机号码！');
      return false;
    }

    if (currentActivity.storeName.length > STORE_NAME_MAX_LENGTH) {
      message.error(`店铺名称不能超过${STORE_NAME_MAX_LENGTH}个字符！`);
      return false;
    }

    if (moment(currentActivity.beginTime).isAfter(moment(currentActivity.endTime))) {
      message.error('结束时间不能早于开始时间！');
      return false;
    }

    return true;
  };

  const handleMediaUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      message.error('只能上传图片或视频文件！');
      return false;
    }

    if (isVideo) {
      try {
        await checkVideoDuration(file);
      } catch (error) {
        message.error(error);
        return false;
      }
    }

    const formData = new FormData();
    formData.append('poster', file);

    try {
      const response = await dispatch(uploadActivityFile(formData));
      const poster = response.payload;

      setCurrentActivity((prev) => ({ ...prev, poster: poster }));
      setPosterFileList([file]);
      message.success('文件上传成功！');
    } catch (error) {
      message.error('文件上传失败，请重试！');
    }

    return false;
  };

  const handleIconUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片！');
      return false;
    }
    const formData = new FormData();
    formData.append('poster', file);
    try {
      const response = await dispatch(uploadActivityFile(formData));
      const iconUrl = response.payload;

      setCurrentActivity((prev) => ({ ...prev, iconUrl: iconUrl }));
      setIconFileList([file]);
      message.success('文件上传成功！');
    } catch (error) {
      message.error('文件上传失败，请重试！');
    }

    return false;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const finalStatus = calculateStatus(
        currentActivity.beginTime,
        currentActivity.endTime
      );
      if (!moment(currentActivity.beginTime).isValid() || 
          !moment(currentActivity.endTime).isValid()) {
        message.error('时间格式不正确');
        return;
      }
      
      const formData = {
        activityId: currentActivity.activityId,
        activityName: currentActivity.activityName,
        couponQuantity: currentActivity.couponQuantity,
        status: finalStatus,
        beginTime: moment(currentActivity.beginTime).format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment(currentActivity.endTime).format('YYYY-MM-DD HH:mm:ss'),
        condition: currentActivity.condition,
        phoneNumber: currentActivity.phoneNumber,
        storeName: currentActivity.storeName,
        posterUrl: currentActivity.poster,
        iconUrl: currentActivity.iconUrl,
      };
      
      const resultAction = await dispatch(addNewActivity(formData));
      
      if (addNewActivity.fulfilled.match(resultAction)) {
        message.success('活动创建成功！');
        setTimeout(()=>{window.location.reload();},500)
        
      } else if (addNewActivity.rejected.match(resultAction)) {
        const error = resultAction.payload;
        message.error(`创建失败 (${error.status}): ${error.data?.message || '检查商家电话号码或店铺名称是否正确'}`);
      }
    } catch (error) {
      message.error('请求处理异常: ' + error.message);
    }
  };

  const isImage = (url) => {
    if (!url) return false;
    if (url.startsWith('data:image/')) return true;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.ico'];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isVideo = (url) => {
    if (!url) return false;
    if (url.startsWith('data:video/')) return true;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  return (
    <div style={{ 
      display: 'flex', 
      padding: '24px', 
      marginTop: '20px', 
      marginLeft: '200px', 
      height: '100vh',
      backgroundColor: '#f5f7fa',
      fontFamily: 'Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    }}>
      {/* 左侧表单区域 */}
      <div style={{ 
        flex: 1, 
        marginRight: '24px', 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '24px',
      }}>
        <h2 style={{ 
          color: '#333', 
          marginBottom: '24px', 
          fontSize: '20px', 
          fontWeight: '600',
          borderBottom: '1px solid #eee',
          padding: '0 0 16px 0',
        }}>
          活动创建
        </h2>
        
        <Form layout="vertical" style={{ 
          color: '#555',
          fontSize: '14px',
        }}>
          {/* 活动名称 */}
          <Form.Item 
            label="活动名称" 
            required 
            style={{ 
              marginBottom: '24px',
            }}
          >
            <Input
              value={currentActivity.activityName}
              onChange={(e) => setCurrentActivity((prev) => ({ ...prev, activityName: e.target.value }))}
              placeholder="请输入活动名称"
              style={{ 
                width: '100%',
                border: '1px solid #e8e8e8',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '14px',
                color: '#333',
              }}
              size="large"
            />
          </Form.Item>

          {/* 活动时间 */}
          <Form.Item 
            label="活动时间" 
            required 
            style={{ 
              marginBottom: '24px',
            }}
          >
            <RangePicker
              showTime={{
                format: 'HH:mm',
                hideDisabledOptions: true,
                disabledHours: () => {
                  const currentHour = moment().hour();
                  return Array.from({ length: currentHour }, (_, i) => i);
                },
                disabledMinutes: (selectedHour) => {
                  if (moment().isSame(moment(), 'day') && selectedHour === moment().hour()) {
                    return Array.from({ length: moment().minute() }, (_, i) => i);
                  }
                  return [];
                }
              }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={disabledDate}
              value={hackValue || [
                currentActivity.beginTime ? moment(currentActivity.beginTime) : null,
                currentActivity.endTime ? moment(currentActivity.endTime) : null,
              ]}
              onChange={handleTimeChange}
              onOpenChange={open => {
                if (open) {
                  setHackValue([null, null]);
                } else {
                  setHackValue(null);
                }
              }}
              style={{ 
                width: '100%',
                border: '1px solid #e8e8e8',
                borderRadius: '6px',
              }}
              size="large"
            />
          </Form.Item>

          {/* 关联商家ID 和 关联店铺ID */}
          <Form.Item 
            label="关联商家电话号码 和 关联店铺名称" 
            required
            extra={`已输入 ${currentActivity.storeName.length}/${STORE_NAME_MAX_LENGTH} 字符`}
            style={{ 
              marginBottom: '24px',
            }}
          >
            <div style={{ 
              display: 'flex', 
              gap: '16px',
            }}>
              <Input
                value={currentActivity.phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setCurrentActivity(prev => ({...prev, phoneNumber: val}));
                }}
                placeholder="请输入商家手机号"
                style={{ 
                  flex: 1,
                  border: '1px solid #e8e8e8',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '14px',
                }}
                size="large"
              />
              <Input
                value={currentActivity.storeName}
                onChange={handleStoreNameChange}
                placeholder="请输入店铺名称"
                style={{ 
                  flex: 1,
                  border: '1px solid #e8e8e8',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '14px',
                }}
                size="large"
              />
            </div>
          </Form.Item>

          {/* 文件上传 */}
          <Form.Item 
            label="上传海报" 
            required 
            style={{ 
              marginBottom: '24px',
            }}
          >
            <Upload
              fileList={posterFileList}
              beforeUpload={handleMediaUpload}
              onRemove={() => {
                setPosterFileList([]);
                setCurrentActivity((prev) => ({ ...prev, poster: '' }));
              }}
              style={{ 
                width: '100%',
              }}
            >
              <Button 
                icon={<UploadOutlined />} 
                style={{ 
                  width: '100%',
                  backgroundColor: '#f0f7ff',
                  color: '#1890ff',
                  border: '1px dashed #1890ff',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                }}
              >
                选择文件
              </Button>
            </Upload>
          </Form.Item>

          {/* 活动图标上传 */}
          <Form.Item 
            label="上传活动图标" 
            required 
            style={{ 
              marginBottom: '24px',
            }}
          >
            <Upload
              fileList={iconFileList}
              beforeUpload={handleIconUpload}
              onRemove={() => {
                setIconFileList([]);
                setCurrentActivity((prev) => ({ ...prev, iconUrl: '' }));
              }}
              style={{ 
                width: '100%',
              }}
            >
              <Button 
                icon={<UploadOutlined />} 
                style={{ 
                  width: '100%',
                  backgroundColor: '#fff0f7',
                  color: '#ff4d4f',
                  border: '1px dashed #ff4d4f',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                }}
              >
                选择文件
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </div>

      {/* 右侧预览区域 */}
      <div style={{ 
        flex: 1, 
        marginLeft: '24px', 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '24px',
      }}>
        <h3 style={{ 
          color: '#333', 
          marginBottom: '24px', 
          fontSize: '18px', 
          fontWeight: '600',
          borderBottom: '1px solid #eee',
          padding: '0 0 16px 0',
        }}>
          活动预览
        </h3>
        
        {currentActivity.poster && (
          <div style={{ 
            marginBottom: '24px',
          }}>
            <h4 style={{ 
              color: '#555', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              海报/视频预览
            </h4>
            {isImage(currentActivity.poster) ? (
              <img
                src={currentActivity.poster}
                alt="海报预览"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              />
            ) : isVideo(currentActivity.poster) ? (
              <video
                src={currentActivity.poster}
                controls
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              />
            ) : (
              <p style={{ 
                color: '#f5222d', 
                fontSize: '14px',
              }}>
                不支持的文件类型
              </p>
            )}
          </div>
        )}
        
        {currentActivity.iconUrl && (
          <div style={{ 
            marginBottom: '24px',
          }}>
            <h4 style={{ 
              color: '#555', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              活动图标预览
            </h4>
            <img
              src={currentActivity.iconUrl}
              alt="活动图标预览"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100px', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
        )}
        
        {/* 提交按钮 */}
        <Form.Item style={{ 
          marginTop: '24px',
        }}>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            style={{ 
              width: '100%',
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: '#40a9ff',
                borderColor: '#40a9ff',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
              },
            }}
          >
            提交活动
          </Button>
        </Form.Item>
      </div>
    </div>
  );
};

export default ActivityManager;