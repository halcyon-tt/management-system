import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatePicker, Table, Card, Spin, Alert, Button, Space, Input } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { fetchOrderList, searchOrder,clearOrderList } from '../../store/modules/userOrderSlice';
import { useMemo } from 'react';
import { useCallback } from 'react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const UserOrder = () => {
  const dispatch = useDispatch();
  const { data: rawData = [], loading, error } = useSelector(state => state.userOrder);
  
  // 筛选状态
  const [dateRange, setDateRange] = useState(null);
  const [searchText, setSearchText] = useState('');
  const normalizedData = useMemo(() => {
    if (!rawData) return [];
    // 处理单体数据情况
    return Array.isArray(rawData) ? rawData : [rawData];
  }, [rawData]);
  const buildListParams = useCallback(() => {
    const params = {};
    if (dateRange?.[0]) {
      params.beginTime = dateRange[0].format('YYYY-MM-DD HH:mm:ss');
    }
    if (dateRange?.[1]) {
      params.endTime = dateRange[1].format('YYYY-MM-DD HH:mm:ss');
    }
    return params;
  }, [dateRange]);
  // 加载数据
  const loadData = useCallback(() => {  // 使用 useCallback 包裹
    dispatch(clearOrderList());
    const params = {
      beginTime: dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
      endTime: dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
      transactionCode: searchText || undefined
    };
    if (searchText) {
      dispatch(searchOrder(params));
    } else {
      dispatch(fetchOrderList(params));
    }
   
  }, [dateRange, searchText, dispatch]);  
  
  useEffect(() => {
    loadData();
  }, []); 

  // 处理搜索
  const handleSearch = () => {
    loadData();
  }

  // 表格列配置
  const columns = [
    {
      title: '订单号',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      width: 200,
      fixed: 'left',
      render: text => text === 'not pay yet' ? 
        <span style={{ color: '#ff4d4f' }}>未生成</span> : 
        text || '--'
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
      key: 'activityName',
      width: 180,
      render: text => text || '--'
    },
    {
      title: '优惠券名称',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      render: text => text || '--'
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      render: text => text || '未绑定'
    },
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 120,
      render: text => text || '未绑定'
    },
    {
      title: '核销时间',
      dataIndex: 'verifyTime',
      key: 'verifyTime',
      width: 200,
      render: text => text ? 
        dayjs(text).format('YYYY-MM-DD HH:mm:ss') : 
        <span style={{ color: '#8c8c8c' }}>未核销</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (text, record) => {
        // 特殊处理未支付订单
        // if (record.transactionCode === 'not pay yet') {
        //   return <span style={{ color: '#ff4d4f' }}>未支付</span>;
        // }
        
        const statusMap = {
          '0': { label: '未支付', color: '#ff4d4f' },
          '1': { label: '已支付', color: '#52c41a' }
        };
        
        return text !== undefined && text !== null ? (
          <span style={{ color: statusMap[text]?.color || '#d48806' }}>
            {statusMap[text]?.label || '未知状态'}
          </span>
        ) : (
          <span style={{ color: '#8c8c8c' }}>--</span>
        );
      }
    },
    {
      title: '金额 (元)',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      fixed: 'right',
      render: text => `¥${Number(text).toFixed(2)}`
    }
  ];

  return (
    <div style={{ 
      padding: 24, 
      marginLeft: 200, 
      height: '100vh',
      background: '#f0f2f5',
      overflow: 'hidden'
    }}>
      <Card
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>订单管理</span>}
        extra={
          <Space wrap>
            <Input
              placeholder="订单号/活动名称"
              allowClear
              value={searchText}
              onChange={e => {
                // dispatch(clearOrderList());
                setSearchText(e.target.value)
              }}
              style={{ width: 200 }}
              onPressEnter={handleSearch}
            />
            <RangePicker
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={setDateRange}
              style={{ width: 360 }}
              value={dateRange}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setDateRange(null);
                setSearchText('');
                dispatch(fetchOrderList());
              }}

            >
              重置
            </Button>
          </Space>
        }
        bordered={false}
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
          height: 'calc(100vh - 48px)'
        }}
      >
        <Spin spinning={loading} tip="加载中...">
          {error && (
            <Alert
              message="错误提示"
              description={error}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 16 }}
            />
          )}

          <Table
            columns={columns}
            dataSource={normalizedData}
            rowKey="transactionCode"
            scroll={{
              x: 1300,
              y: 'calc(100vh - 220px)' // 动态计算滚动高度
            }}
            pagination={false} // 禁用分页
            bordered
            locale={{
              emptyText: (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  {/* <img src="/empty-orders.png" alt="空状态" style={{ width: 120 }} /> */}
                  <p style={{ marginTop: 16, color: 'rgba(0,0,0,.45)' }}>暂无相关订单数据</p>
                </div>
              )
            }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default UserOrder;