import React from 'react';
import { Row, Col, Card,  Spin } from 'antd';
import { useSelector } from 'react-redux';
import FloatingActionButton from './FloatingActionButton';
import PageHeader from '../coupon/PageHeader'
// import ErrorAlert from '../coupon/ErroAlert'
import CouponListCard from '../coupon/CouponListCard'
import { useParams } from 'react-router-dom';
import './coupon.scss';


const CouponPage = () => {
  const { 
    couponList,
    loading,
    // error 
  } = useSelector(state => state.coupon);
  const { activityId } = useParams(); 
  return (
    <div className="coupon-management-container">
      <Card bordered={false} className="management-card">
        {/* 错误提示区块 */}
        {/* {error && <ErrorAlert error={error} />} */}

        <Spin spinning={loading} tip="加载中..." size="large">
          <PageHeader activityId={activityId} />
          
          <Row gutter={[24, 24]}>
            {/* 移除表单区域 */}
            
            {/* 全宽列表区域 */}
            <Col span={24}>
              <CouponListCard 
                couponList={couponList}
                activityId={activityId}
              />
            </Col>
          </Row>
        </Spin>
      </Card>
      
      <FloatingActionButton activityId={activityId} />
    </div>
  );
};

export default CouponPage;