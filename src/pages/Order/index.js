import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Card, Spin, DatePicker, Input, Button, Select, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { fetchOrderStatistics } from '../../store/modules/orderSlice';
import { message } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import { getToken } from '../../utils/token';
import isBetween from 'dayjs/plugin/isBetween';
import './Order.scss';
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;

const Order = () => {
  const dispatch = useDispatch();
  const { orderStatistics, loading } = useSelector((state) => state.order);
  
  const [queryParams, setQueryParams] = useState({
    activityName: '',
    status: null, // 修改初始值为null表示"全部"
    timeRange: []
  });

  const [processedData, setProcessedData] = useState([]);
  const [displayData, setDisplayData] = useState([]);

  // 更新状态选项配置
  const statusOptions = [
    { value: null, label: '全部' },
    { value: 1, label: '进行中' },
    { value: 0, label: '已结束' },
    { value: -1, label: '未开始' }
  ];

  // 初始化加载数据
  useEffect(() => {
    dispatch(fetchOrderStatistics());
  }, [dispatch]);

  // 直接使用后端数据（移除状态计算逻辑）
  useEffect(() => {
    if (orderStatistics?.data?.data) {
      // 确保data.data是数组才设置
      setProcessedData(Array.isArray(orderStatistics.data.data) 
        ? orderStatistics.data.data 
        : []);
      setDisplayData(Array.isArray(orderStatistics.data.data) 
        ? orderStatistics.data.data 
        : []);
    }
  }, [orderStatistics]);

  const handleExport = async () => {
    try {
      // 构建请求参数
      const params = {
        beginTime: queryParams.timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss') || '',
        endTime: queryParams.timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss') || ''
      };
  
      // 直接调用后端接口（绕过 Redux）
      const response = await axios.post(
        'https://xkyx.fun/admin/order/data/statistics/export',
        params,
        {
          responseType: 'blob', // 关键配置
          headers: {
            'Authentication': ` ${getToken()}` // 使用标准 Authorization 头
          }
        }
      );
  
      // 解码文件名（RFC 5987 规范）
      const decodeFilename = (header) => {
        // 基础文件名解析
        const baseName = (() => {
          if (!header) return '订单统计';
          const encodedName = header.split('filename*=')[1]?.replace(/"/g, '');
          return encodedName 
            ? decodeURIComponent(encodedName.replace(/\+/g, '%20')) 
            : '全平台订单统计';
        })().replace(/\s*\(\d+\)/g, ''); // 移除已有括号数字

        // 生成时间戳（格式：年月日_时分秒）
        const timestamp = new Date()
          .toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
          .replace(/[/\s:]/g, '') // 20240329_154025
          .replace(/^(\d{8})_?(\d+)/, '$1_$2'); // 确保下划线分隔

        // 安全处理文件名
        const safeName = baseName
          .replace(/[\\/:*?"<>|]/g, '') // 过滤非法字符
          .replace(/\.xlsx$/, ''); // 去除已有扩展名

        return `${safeName}_${timestamp}.xlsx`; // 最终文件名
      };

      // 获取带时间戳的文件名
      const filename = decodeFilename(response.headers['content-disposition']);

  
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // 使用后端返回的文件名
      link.style.display = 'none';
  
      // 触发下载
      document.body.appendChild(link);
      link.click();
  
      // 清理资源
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
  
      message.success('导出成功');
    } catch (error) {
      message.error(`导出失败: ${error.response?.data?.message || error.message}`);
      console.error('错误详情:', {
        status: error.response?.status,
        headers: error.response?.headers,
        data: error.response?.data
      });
    }
  };

  // 处理查询
  const handleQuery = () => {
    let result = [...processedData];
    // 准备API请求参数
  const apiParams = {};
  
  // 添加时间范围参数
  if (queryParams.timeRange?.length === 2) {
    apiParams.beginTime = queryParams.timeRange[0].format('YYYY-MM-DD HH:mm:ss');
    apiParams.endTime = queryParams.timeRange[1].format('YYYY-MM-DD HH:mm:ss');
  }
  
  // 添加其他查询条件
  if (queryParams.activityName.trim()) {
    apiParams.activityName = queryParams.activityName;
  }
  
  if (queryParams.status !== null) {
    apiParams.status = queryParams.status;
  }
  
  // 发起API请求
  dispatch(fetchOrderStatistics(apiParams));
    // 状态过滤（null表示显示全部）
    if (queryParams.status !== null) {
      result = result.filter(item => item.status === queryParams.status);
    }

    // 活动名称模糊搜索
    if (queryParams.activityName.trim()) {
      const searchTerm = queryParams.activityName.toLowerCase();
      result = result.filter(item => 
        item.activityName.toLowerCase().includes(searchTerm)
      );
    }

    // 时间范围过滤
    if (queryParams.timeRange?.length === 2) {
      const [start, end] = queryParams.timeRange;
      result = result.filter(item => {
        const createTime = dayjs(item.createTime);
        return createTime.isAfter(start) && createTime.isBefore(end);
      });
    }

    setDisplayData(result);
  };

  // 更新表格状态列配置
  const columns = [
    { title: '活动名称', dataIndex: 'activityName', key: 'activityName' },
    { title: '套餐名称', dataIndex: 'couponName', key: 'couponName' },
    {
      title: '总领取量',
      dataIndex: 'totalCollection',
      key: 'totalCollection',
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: '有效核销',
      dataIndex: 'validVerified',
      key: 'validVerified',
      render: (text) => (
        <Tag color="green">{text}</Tag>
      )
    },
    {
      title: '无效核销',
      dataIndex: 'invalidVerified',
      key: 'invalidVerified',
      render: (text) => (
        <Tag color="orange">{text}</Tag>
      )
    },
    {
      title: '未核销',
      dataIndex: 'unverified',
      key: 'unverified',
      render: (text) => (
        <Tag color="red">{text}</Tag>
      )
    },
    { 
      title: '状态', 
      key: 'status',
      render: (_, record) => {
        let statusConfig = {
          1: { color: 'green', text: '进行中' },
          0: { color: 'volcano', text: '已结束' },
          [-1]: { color: 'geekblue', text: '未开始' }
        }[record.status] || { color: 'default', text: '未知状态' };
        
        return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
      }
    }
  ];

  return ( 
    <div style={{ 
      padding: '24px', 
      marginTop: '20px', 
      marginLeft: '200px', 
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      overflowY: 'auto', // 添加y轴滚动条
      maxHeight: '100vh', // 限制最大高度
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
          全平台订单数据统计
        </h1>
      </div>

      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '24px',
        marginBottom: '24px',
      }}>
        {/* 查询条件 */}
        <div className="query-filters" style={{ 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <Input
            placeholder="活动名称"
            allowClear
            value={queryParams.activityName}
            onChange={e => setQueryParams(p => ({...p, activityName: e.target.value}))}
            style={{ 
              width: '200px',
              border: '1px solid #e8e8e8',
              borderRadius: '6px',
              padding: '10px 12px',
            }}
            size="large"
          />

          <Select
            placeholder="活动状态"
            value={queryParams.status}
            onChange={value => setQueryParams(p => ({...p, status: value}))}
            style={{ 
              width: '120px',
              border: '1px solid #e8e8e8',
              borderRadius: '6px',
            }}
          >
            {statusOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>

          <RangePicker
            showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD HH:mm:ss"
            value={queryParams.timeRange}
            onChange={dates => setQueryParams(p => ({...p, timeRange: dates}))}
            placeholder={['开始时间', '结束时间']}
            style={{ 
              border: '1px solid #e8e8e8',
              borderRadius: '6px',
              width: '300px',
            }}
          />

          <Button 
            type="primary" 
            onClick={handleQuery}
            loading={loading}
            style={{ 
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              borderRadius: '6px',
              padding: '0 16px',
              marginRight: '10px',
            }}
          >
            查询
          </Button>

          <Button 
            onClick={() => {
              setQueryParams({
                activityName: '',
                status: null,
                timeRange: []
              });
              setDisplayData(processedData);
            }}
            style={{ 
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              padding: '0 16px',
            }}
          >
            重置
          </Button>
        </div>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          style={{ 
            backgroundColor: '#1890ff',
            borderColor: '#1890ff',
            borderRadius: '6px',
            padding: '0 16px',
            marginBottom: '20px',
          }}
        >
          导出Excel
        </Button>

        {/* 汇总统计 */}
        {orderStatistics?.data && (
          <div style={{ 
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <Tag color="blue">总领取量 {orderStatistics.data.totalCollectionSum}</Tag>
            <Tag color="green">有效核销{orderStatistics.data.validVerifiedSum}</Tag>
            <Tag color="orange">无效核销{orderStatistics.data.invalidVerifiedSum}</Tag>
            <Tag color="red">未核销{orderStatistics.data.unverifiedSum}</Tag>
          </div>
        )}

        {/* 数据表格 */}
        <Spin spinning={loading}>
          <Card className="data-card" style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <Table
              columns={columns}
              dataSource={displayData || []}
              rowKey={(record) => `${record.activityName}-${record.couponName}-${record.status}`}
              pagination={{ 
                pageSize: 10, 
                showTotal: total => `共 ${total} 条`,
                showSizeChanger: false,
              }}
              scroll={{y:1000}}
              locale={{ emptyText: '暂无数据' }}
              style={{ 
                width: '100%',
              }}
            />
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default Order;