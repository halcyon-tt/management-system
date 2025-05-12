import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatePicker } from 'antd';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment, { now } from 'moment';
import { uploadActivityFile } from '../../store/modules/activitySlice';
import { Table, Button, Input, Space, Modal, message, Form } from 'antd';
import {
  fetchActivities,
  searchActivities,
  updateActivity,
  removeActivity,
} from '../../store/modules/activitySlice';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'
import styled from 'styled-components';
const StyledRangePicker = styled(DatePicker.RangePicker)`
  &&& {
    .ant-picker-input input {
      pointer-events: none !important;
      cursor: default !important;
      background-color: transparent !important;
      caret-color: transparent !important;
    }
    
    .ant-picker-input {
      pointer-events: none !important;
    }
    
    .ant-picker-suffix,
    .ant-picker-clear,
    .ant-picker-separator {
      pointer-events: auto !important;
      cursor: pointer !important;
    }
    
    /* 防止整个输入区域可点击 */
    .ant-picker-active-bar {
      display: none !important;
    }
    
    /* 确保边框点击也不触发 */
    border-color: #d9d9d9 !important;
    &:hover {
      border-color: #d9d9d9 !important;
    }
  }
`;
function ActivityController() {

  const dispatch = useDispatch();
  const { activities, loading } = useSelector((state) => state.activity);
  const [searchValue, setSearchValue] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 获取活动列表
  useEffect(() => {
    dispatch(fetchActivities({}));
  }, [dispatch]);

  // 搜索结果按钮
  const handleSearch = () => {
    dispatch(searchActivities({ activityName: searchValue.trim() }));
  };

  // 更新活动信息
  const calculateStatus = (beginTime, endTime) => {
    const now = dayjs();
    const start = moment(beginTime);
    const end = moment(endTime);
    
    if (!start.isValid() || !end.isValid()) return -1;
    if (now.isBefore(start)) return -1;
    if (now.isAfter(end)) return 0;
    return 1;
  };

  // 修改handleUpdate函数
  const handleUpdate = (activity) => {
    setSelectedActivity(activity);
    form.resetFields();
    
    const initialValues = {
      ...activity,
      dateRange: [
        activity.beginTime ? dayjs(activity.beginTime) : now, 
        activity.endTime ? dayjs(activity.endTime) : now 
      ],
      status: calculateStatus(activity.beginTime, activity.endTime)
    };

    form.setFieldsValue(initialValues);
    setIsModalVisible(true);
  };

  // 添加时间变更处理函数
  const handleTimeChange = (dates) => {
    if (!dates) return;
    const [beginTime, endTime] = dates;
    const newStatus = calculateStatus(
      beginTime?.format('YYYY-MM-DD HH:mm:ss'),
      endTime?.format('YYYY-MM-DD HH:mm:ss')
    );
    
    form.setFieldsValue({
      status: newStatus
    });
  };

  // 过滤已结束的活动
  const filterActiveActivities = (activities) => {
    return activities.filter(activity => {
      if (!activity || activity.status === undefined || activity.status === null) {
        return false;
      }
      return activity.status !== 0;
    });
  };
  const filteredActivities = React.useMemo(() => {
    return filterActiveActivities(activities);
  }, [activities]);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('poster', file);
  
    try {
      const result = await dispatch(uploadActivityFile(formData));
      if (result.payload) {
        return result.payload; 
      }
    } catch (error) {
      message.error('文件上传失败，请重试！');
    }
  };

  // 提交更新
  const handleUpdateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [beginTime, endTime] = values.dateRange;
      const finalStatus = calculateStatus(
        beginTime?.format('YYYY-MM-DD HH:mm:ss'),
        endTime?.format('YYYY-MM-DD HH:mm:ss')
      );
      const formattedValues = {
        ...values,
        beginTime: beginTime?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: endTime?.format('YYYY-MM-DD HH:mm:ss'),
        status: finalStatus
      };
  
      const updatedActivity = { 
        ...selectedActivity, 
        ...formattedValues 
      };
      await dispatch(updateActivity(updatedActivity));
      message.success('活动更新成功！');
      dispatch(fetchActivities({}));
      setIsModalVisible(false);
    } catch (error) {
      message.error(error.message || '活动更新失败，请重试！');
    }
  };

  // 下架活动
  const handleRemove = async (activityId) => {
    try {
      await dispatch(removeActivity(activityId));
      message.success('活动下架成功！');
    } catch (error) {
      message.error('活动下架失败，请重试！');
    }
  };

  // 禁用日期逻辑
  const disabledDate = (current) => {
    return current && current < moment().subtract(1, 'month').startOf('day');
  };

  // 时间选择器属性
  const timePickerProps = {
    showTime: {
      format: 'HH:mm',
      hideDisabledOptions: true,
      disabledHours: () => {
        const now = moment();
        return Array.from({ length: now.hour() }, (_, i) => i);
      },
      disabledMinutes: (selectedHour) => {
        const now = moment();
        if (selectedHour === now.hour()) {
          return Array.from({ length: now.minute() }, (_, i) => i);
        }
        return [];
      },
    },
    format: "YYYY-MM-DD HH:mm:ss",
    style: { 
      width: '100%',
      border: '1px solid #e8e8e8',
      borderRadius: '6px',
      padding: '10px 12px',
    },
    onChange: handleTimeChange,
    disabledDate,
    inputReadOnly: true,
  };

  // 表格列配置
  const columns = [
    {
      title: '店铺名称',
      dataIndex: 'storeName',
      key: 'storeName',
      width: '15%',
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
      key: 'activityName',
      width: '20%',
    },
    {
      title: '开始时间',
      dataIndex: 'beginTime',
      key: 'beginTime',
      width: '15%',
      render: (beginTime) => (
        <span>{beginTime}</span>
      ),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: '15%',
      render: (endTime) => (
        <span>{endTime}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => {
        switch (status) {
          case 1:
            return <span style={{ color: '#52c41a' }}>进行中</span>;
          case 0:
            return <span style={{ color: '#f5222d' }}>已结束</span>;
          case -1:
            return <span style={{ color: '#1890ff' }}>未开始</span>;
          default:
            return '未知状态';
        }
      },
    },
    {
      title: '海报/视频',
      dataIndex: 'posterUrl',
      key: 'posterUrl',
      width: '15%',
      render: (posterUrl) => (
        posterUrl ? (
          posterUrl.startsWith('http') ? (
            posterUrl.endsWith('.mp4') ? (
              <video src={posterUrl} controls style={{ width: '100px', height: 'auto' }} />
            ) : (
              <img src={posterUrl} alt="海报" style={{ width: '100px', height: 'auto' }} />
            )
          ) : (
            <span>无效的 URL</span>
          )
        ) : (
          <span>无</span>
        )
      ),
    },
    {
      title: '活动图标',
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      width: '10%',
      render: (iconUrl) => (
        iconUrl ? (
          <img src={iconUrl} alt="活动图标" style={{ width: '50px', height: '50px' }} />
        ) : (
          <span>无</span>
        )
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={(e) => {
            e.stopPropagation();
            handleUpdate(record);
          }}>
            编辑
          </Button>
          <Button danger onClick={(e) => {
            e.stopPropagation();
            handleRemove(record.activityId);
          }}>
            下架
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: '24px', 
      marginTop: '20px', 
      marginLeft: '200px', 
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      overflowY: 'auto', 
      maxHeight: '100vh', 
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h1 style={{ 
          color: '#333', 
          fontSize: '24px', 
          fontWeight: '600',
          borderBottom: '1px solid #eee',
          padding: '0 0 16px 0',
        }}>
          活动管理
        </h1>

        {/* 搜索功能 */}
        <Space style={{ marginBottom: '24px', marginTop: '16px' }}>
          <Input
            placeholder="输入活动名称搜索"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ 
              width: '300px',
              border: '1px solid #e8e8e8',
              borderRadius: '6px',
              padding: '10px 12px',
            }}
            size="large"
          />
          <Button 
            type="primary" 
            onClick={handleSearch}
            style={{ 
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              borderRadius: '6px',
              padding: '0 16px',
              fontSize: '14px',
            }}
          >
            搜索
          </Button>
        </Space>
      </div>

      {/* 活动列表 */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '24px',
      }}>
        <Table
          columns={columns}
          dataSource={filteredActivities}
          loading={loading}
          rowKey="activityId"
          onRow={(record) => ({
            onClick: () => {
              navigate(`/activities/${record.activityId}/coupons`, {
                state: { 
                  activityId: record.activityId,
                  activityName: record.activityName 
                }
              });
            }
          })}
          pagination={{ 
            pageSize: 4,     
            showSizeChanger: false,
            hideOnSinglePage: true,
            total: filteredActivities.length,
          }}
          style={{ 
            width: '100%',
          }}
        />
      </div>

      {/* 编辑活动模态框 */}
      <Modal
        title="编辑活动"
        open={isModalVisible}
        onOk={handleUpdateSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        style={{ 
          top: '20px',
        }}
      >
        {selectedActivity && (
          <Form layout="vertical" initialValues={selectedActivity} form={form}>
            <Form.Item
              label="活动名称"
              name="activityName"
              rules={[{ required: true, message: '请输入活动名称' }]}
              style={{ 
                marginBottom: '24px',
              }}
            >
              <Input 
                placeholder="请输入活动名称"
                style={{ 
                  width: '100%',
                  border: '1px solid #e8e8e8',
                  borderRadius: '6px',
                  padding: '10px 12px',
                }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="时间范围"
              name="dateRange"
              rules={[
                { required: true, message: '请选择时间范围' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value.length !== 2) {
                      return Promise.reject(new Error('请选择开始时间和结束时间'));
                    }
                    const [beginTime, endTime] = value;
                    if (beginTime && endTime && beginTime.isAfter(endTime)) {
                      return Promise.reject(new Error('开始时间不能晚于结束时间'));
                    }
                    return Promise.resolve();
                  }
                })
              ]}
              style={{ 
                marginBottom: '24px',
              }}
            >
              <StyledRangePicker {...timePickerProps}  />
            </Form.Item>

            <Form.Item
              label="状态"
              name="status"
              style={{ 
                marginBottom: '24px',
              }}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="海报/视频"
              name="posterUrl"
              style={{ 
                marginBottom: '24px',
              }}
            >
              <Upload
                name="file"
                maxCount={1}
                customRequest={async ({ file, onSuccess, onError }) => {
                  try {
                    const fileUrl = await handleUpload(file);
                    onSuccess(fileUrl);
                  } catch (error) {
                    onError(error);
                  }
                }}
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    const fileUrl = info.file.response;
                    form.setFieldsValue({ posterUrl: fileUrl });
                    message.success(`${info.file.name} 上传成功`);
                  } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 上传失败`);
                  }
                }}
                beforeUpload={(file) => {
                  const isImageOrVideo = 
                    file.type.startsWith('image/') || 
                    file.type.startsWith('video/');
                  if (!isImageOrVideo) message.error('仅支持图片或视频文件！');
                  return isImageOrVideo;
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
                  }}
                >
                  点击上传
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="活动图标"
              name="iconUrl"
              style={{ 
                marginBottom: '24px',
              }}
            >
              <Upload
                name="file"
                maxCount={1}
                customRequest={async ({ file, onSuccess, onError }) => {
                  try {
                    const fileUrl = await handleUpload(file);
                    onSuccess(fileUrl);
                  } catch (error) {
                    onError(error);
                  }
                }}
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    const fileUrl = info.file.response;
                    form.setFieldsValue({ iconUrl: fileUrl });
                    message.success(`${info.file.name} 上传成功`);
                  } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 上传失败`);
                  }
                }}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/');
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isImage) message.error('仅支持图片文件！');
                  if (!isLt5M) message.error('文件大小不能超过 5MB!');
                  return isImage && isLt5M;
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
                  }}
                >
                  点击上传
                </Button>
              </Upload>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
export default ActivityController;