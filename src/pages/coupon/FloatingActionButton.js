// FloatingActionButton.jsx
import { FloatButton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CouponModal from '../coupon/couponAdd';
import { useState } from 'react';
const FloatingActionButton = ({ activityId }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setModalVisible(true)}
      />
      
      <CouponModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        activityId={activityId}
      />
    </>
  );
};
export default FloatingActionButton