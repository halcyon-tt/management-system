// src/components/PageHeader.jsx
import { Typography } from 'antd';
import { useSelector } from 'react-redux';
const { Title, Text } = Typography;

const PageHeader = ({ activityId }) => {
  const { currentActivity } = useSelector(state => state.activity);

  return (
    <div className="header-section">
      <Title level={5} className="page-title">
        {currentActivity?.activityName || '优惠券管理'}
      </Title>
      <Text type="secondary" className="sub-title">
        {activityId ? `活动ID:${activityId}` : '全平台优惠券管理'}
      </Text>
    </div>
  );
};
export default PageHeader