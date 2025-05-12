import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Switch, Space, message, Tag, Popconfirm, Button, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { fetchFeedback, toggleStatus, deleteFeedback } from '../../store/modules/feedbackSlice';
import dayjs from 'dayjs';

const { Option } = Select;

const UserManager = () => {
  const dispatch = useDispatch();
  const { feedbackList, loading, error } = useSelector(state => state.feedback);
  const [selectedType, setSelectedType] = useState('all');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { 
    dispatch(fetchFeedback());
  }, [dispatch]);

  useEffect(() => {
    error && message.error(error);
  }, [error]);

  // 处理状态切换
  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      if (isNaN(feedbackId)) throw new Error('无效的反馈ID');
      
      await dispatch(toggleStatus({ 
        feedbackId: Number(feedbackId),
        newStatus 
      })).unwrap();
      await dispatch(fetchFeedback());
      message.success('状态已更新');
    } catch (err) {
      message.error(`更新失败: ${err.message}`);
    }
  };

  // 处理删除操作
  const handleDelete = async (feedbackId) => {
    try {
      await dispatch(deleteFeedback(feedbackId)).unwrap();
      message.success('反馈已删除');
    } catch (err) {
      message.error(`删除失败: ${err.message}`);
    }
  };

  // 分类过滤后的数据
  const filteredData = selectedType === 'all' 
    ? feedbackList 
    : feedbackList.filter(item => item.type === selectedType);

  // 表格列配置
  const columns = [
    {
      title: '反馈类型',
      dataIndex: 'type',
      key: 'type',
      render: type => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '反馈内容',
      dataIndex: 'content',
      key: 'content',
      width: '30%',
    },
    {
      title: '联系方式',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: text => text || '未提供',
    },
    {
      title: '提交时间',
      dataIndex: 'releaseTime',
      key: 'releaseTime',
      render: time => time 
        ? dayjs(time).format('YYYY-MM-DD HH:mm') 
        : '未知时间',
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status ? 'green' : 'volcano'}>
          {status ? '已处理' : '待处理'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Switch
            checked={record.status}
            onChange={checked => handleStatusChange(record.feedbackId, checked)}
          />
          <Popconfirm
            title="确定删除此反馈？"
            onConfirm={() => handleDelete(record.feedbackId)}
          >
            <Button 
              danger 
              type="link" 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', marginTop: '20px', marginLeft: '200px' }} >
      <h2>用户反馈管理</h2>
      
      {/* 分类筛选器 */}
      <div style={{ marginBottom: 16 }}>
        <Select
          defaultValue="all"
          style={{ width: 200 }}
          onChange={value => setSelectedType(value)}
        >
          <Option value="all">全部类型</Option>
          <Option value="活动建议">活动建议</Option>
          <Option value="内容投诉">内容投诉</Option>
          <Option value="服务态度">服务态度</Option>
          <Option value="活动奖励">活动奖励</Option>
          <Option value="其他反馈">其他反馈</Option>
        </Select>
      </div>

      <div style={{ 
        maxHeight: '600px', 
        overflowY: 'auto',
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        padding: '16px',
        background: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="feedbackId"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            pageSize: pageSize,
            pageSizeOptions: ['5', '10'],
            onShowSizeChange: (current, size) => setPageSize(size),
          }}
          bordered
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default UserManager;