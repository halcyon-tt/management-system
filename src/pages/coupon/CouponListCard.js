import { Card, Statistic } from 'antd';
import { Space } from 'antd';
import CouponManager from '../coupon/couponManager';

const CouponListCard = ({ couponList, activityId }) => {
  const validCount = couponList.filter(item => 
    new Date(item.endTime) > new Date()
  ).length;

  return (
    <Card
      className="list-card"
      headStyle={{ display: 'none' }} // 隐藏卡片头部
      extra={
        <Space>
          <Statistic title="总数" value={couponList.length} style={{ marginRight: 16 }} />
          <Statistic title="有效" value={validCount} />
        </Space>
      }
    >
      <CouponManager activityId={activityId} />
    </Card>
  );
};
export default CouponListCard