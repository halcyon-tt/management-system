import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Button, Table, Form, Input, Modal, Alert, Spin, Popconfirm, Row, Col, Card,
  Tag, Divider, Typography 
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  LockOutlined
} from '@ant-design/icons';
import {
  fetchMerchantList,
  registerMerchant,
  deleteMerchant,
  updateMerchant,
  setCurrentMerchant,
  clearError
} from '../../store/modules/merchantSlice';


const { Title, Text } = Typography;

const Merchant = () => {
  const dispatch = useDispatch();
  const { merchantList, loading, error, currentMerchant } = useSelector(state => state.merchant);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 列配置
  const columns = [
    {
      title: <Text type="secondary">商家名称</Text>,
      dataIndex: 'merchantName',
      key: 'merchantName',
      render: (text) => <Tag icon={<ShopOutlined />} color="geekblue">{text}</Tag>
    },
    {
      title: <Text type="secondary">店铺信息</Text>,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium">{record.storeName ?? '-'}</div>
          <div className="text-gray-500 text-sm">{record.storeAddress ?? '-'}</div>
        </div>
      )
    },
    {
      title: <Text type="secondary">联系方式</Text>,
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text) => (
        <div className="flex items-center">
          <PhoneOutlined className="mr-2 text-gray-400" />
          <Text copyable>{text}</Text>
        </div>
      )
    },
    {
      title: <Text type="secondary">操作</Text>,
      key: 'action',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            className="text-blue-500 hover:text-blue-600 border-none"
          />
          <Popconfirm
            title="确认删除该商家？"
            onConfirm={() => dispatch(deleteMerchant(record.merchantId))}
            okText="确认"
            cancelText="取消"
            placement="left"
          >
            <Button 
              icon={<DeleteOutlined />} 
              className="text-red-400 hover:text-red-500 border-none"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchMerchantList());
      } catch (error) {
        console.error('数据加载失败:', error);
      }
    };
    loadData();
  }, [dispatch]);


  const formatIdCard = (idCard) => {
    if (!idCard) return '';
    // 只显示前3位和后3位，中间用星号代替
    return idCard.replace(/(\d{3})\d{10}(\d{3})/, '$1**********$2');
  };






  const handleEdit = (record) => {
    console.log('record:', record);
    dispatch(setCurrentMerchant(record));

    form.setFieldsValue({
      merchantName: record.merchantName,
      phoneNumber: record.phoneNumber,
      username: record.username,  
      storeName: record.storeName,
      storeAddress: record.storeAddress,
      password:record.password,
      idCard:record.idCard
    });
    setIsModalOpen(true);
  };

  const onFinish = async (values) => {
    try {
      if (currentMerchant) {
        await dispatch(updateMerchant({ ...currentMerchant, ...values }));
      } else {
        await dispatch(registerMerchant(values));
      }
  
      // 强制刷新数据（移除条件判断）
      console.log('开始刷新商户列表...');
      await dispatch(fetchMerchantList());
      console.log('数据刷新完成');
  
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('操作失败:', error);
      // 保持弹窗打开显示错误
      setIsModalOpen(false); 
      form.resetFields();
    }
  };
  return (
    <div style={{ padding: '24px', marginTop: '20px', marginLeft: '200px' }}>
      <Spin spinning={loading} tip="数据加载中..." size="large">
        <Card
          title={<Title level={4} className="m-0">商家管理系统</Title>}
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setIsModalOpen(true);
                dispatch(setCurrentMerchant(null));
              }}
              className="flex items-center"
            >
              新建商家
            </Button>
          }
          bordered={false}
          className="shadow-lg rounded-xl border border-gray-100"
        >
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => dispatch(clearError())}
              className="mb-6 rounded-lg"
            />
          )}

          <Table
            columns={columns}
            key={merchantList.length}
            dataSource={merchantList}
            rowKey="merchantId"
            pagination={{ 
              pageSize: 6,
              showSizeChanger: false,
              className: "px-4",
              itemRender: (_, type, originalElement) => {
                if (type === 'prev' || type === 'next') {
                  
                  return <span className="ant-pagination-item-link">{originalElement}</span>;
                }
                return originalElement;
              }
            }}
            rowClassName={(_, index) => 
              index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-100'
            }
            className="rounded-lg border border-gray-200"
            scroll={{ x: 800 }}
          />

          <Modal
            title={
              <div className="flex items-center text-lg">
                {currentMerchant ? (
                  <>
                    <EditOutlined className="mr-2 text-blue-500" />
                    <span>编辑商家信息</span>
                  </>
                ) : (
                  <>
                    <PlusOutlined className="mr-2 text-green-500" />
                    <span>新建商家账户</span>
                  </>
                )}
              </div>
            }
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            destroyOnClose
            width={800}
            centered
          >
            <Divider className="my-4" />
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ remember: true }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>商家姓名</Text>}
                    name="merchantName"
                    rules={[{ required: true, message: '请输入商家姓名' }]}
                  >
                    <Input 
                      prefix={<ShopOutlined className="text-gray-400" />} 
                      placeholder="例：霸王茶姬" 
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>手机号</Text>}
                    name="phoneNumber"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
                    ]}
                  >
                    <Input 
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="11位手机号" 
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>身份证号</Text>}
                    name="idCard"
                    rules={[
                      { required: true, message: '请输入身份证号' },
                      { pattern: /^\d{17}[\dXx]$/, message: '身份证格式不正确' }
                    ]}
                    getValueProps={(value) => ({
                      value: currentMerchant ? formatIdCard(value) : value
                    })}
                  >
                    <Input 
                      prefix={<IdcardOutlined className="text-gray-400" />}
                      placeholder="18位身份证号" 
                      className="rounded-lg"
                      // value={formatIdCard(form.getFieldValue('idCard'))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>用户名</Text>}
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input 
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="登录用户名" 
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>店铺名称</Text>}
                    name="storeName"
                    rules={[{ required: true, message: '请输入店铺名称' }]}
                  >
                    <Input 
                      prefix={<ShopOutlined className="text-gray-400" />}
                      placeholder="例：朝阳门店" 
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>店铺地址</Text>}
                    name="storeAddress"
                    rules={[{ required: true, message: '请输入店铺地址' }]}
                  >
                    <Input.TextArea 
                      prefix={<EnvironmentOutlined className="text-gray-400" />}
                      placeholder="详细地址" 
                      rows={3} 
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row> 

              <Form.Item
                label={<Text strong>密码</Text>}
                name="password"
                rules={[
                  { required: !currentMerchant, message: '请输入密码' },
                  { min: 6, message: '密码至少6位' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder={currentMerchant ? '留空不修改' : '登录密码'} 
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="text-right mt-6">
                <Button 
                  onClick={() => setIsModalOpen(false)} 
                  className="mr-2 px-6 h-10 rounded-lg"
                >
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  className="px-6 h-10 rounded-lg"
                >
                  {currentMerchant ? '更新信息' : '创建账户'}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </Spin>
    </div>
  );
};

export default Merchant;