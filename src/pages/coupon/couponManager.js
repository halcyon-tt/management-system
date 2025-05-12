// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchCoupons, deleteCoupon, setCurrentCoupon } from '../../store/modules/couponSlice';

//  const CouponManager = () => {
//   const dispatch = useDispatch();
//   const { couponList, loading, error } = useSelector(state => state.coupon);

//   useEffect(() => {
//     dispatch(fetchCoupons());
//   }, [dispatch]);

//   return (
//     <div className="coupon-list">
//       {error && <div className="error">{error}</div>}
      
//       {loading ? (
//         <div className="loading-indicator">加载中...</div>
//       ) : (
//         couponList.map(coupon => (
//           <div className="coupon-grid">
//           <div key={coupon.couponId} className="coupon-card">
//             <h3>{coupon.packageName}</h3>
//             <div className="price">
//               <span className="discount">¥{coupon.discountPrice}</span>
//               <span className="original">¥{coupon.originalPrice}</span>
//             </div>
//             <div className="details">
//               <p>{coupon.couponDetails.details}</p>
//               <p>使用条件：{coupon.couponDetails.condition}</p>
//             </div>
//             <div className="actions">
//               <button onClick={() => dispatch(setCurrentCoupon(coupon))}>
//                 编辑
//               </button>
//               <button onClick={() => dispatch(deleteCoupon(coupon.couponId))}>
//                 删除
//               </button>
//             </div>
//           </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };
// export default CouponManager
// CouponManager.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
   Card, Popconfirm, Tag, Image, List,  Alert 
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import { 
  fetchCoupons, 
  deleteCoupon, 
  setCurrentCoupon,
} from '../../store/modules/couponSlice';
import CouponAdd from '../coupon/couponAdd';
import { message } from 'antd';
import { useState } from 'react';
import CouponEditModal from '../coupon/couponEditModal';

const CouponManager = ({ activityId }) => {
  const dispatch = useDispatch();

  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleEditClick = (coupon) => {
    dispatch(setCurrentCoupon(coupon));  
    setEditModalVisible(true);          // 打开编辑模态框
  };
  const { 
    couponList, 
    loading, 
    error,
    currentCoupon 
  } = useSelector(state => state.coupon);
  const [modalVisible, setModalVisible] = useState(false);

  // 初始化加载所有数据
  useEffect(() => {
    dispatch(fetchCoupons(activityId));
  }, [dispatch, activityId]);

  const handleDelete = async id => {
    try {
      await dispatch(deleteCoupon(id));
      message.success('优惠券已删除');
      dispatch(fetchCoupons(activityId)); // 删除后重新加载
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };
  
  
  return (
    <div style={{ 
      height: 'calc(100vh - 180px)',
      overflowY: 'auto',
      padding: '0 16px',
      border: '1px solid #f0f0f0',
      borderRadius: '8px'
    }}>
      <div style={{ padding: '16px 0' }}>
        {error && (
          <Alert 
            message="加载错误"
            description={error}
            type="error"
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        <List
          loading={loading}
          grid={{ gutter: 16, column: 3 }}
          dataSource={couponList}
          renderItem={coupon => (
            <List.Item>
              <Card
                style={{ borderRadius: 8 }}
                cover={
                  <Image
                    src={coupon.posterUrl}
                    alt="优惠券封面"
                    preview={false}
                    height={180}
                    style={{ 
                      objectFit: 'cover',
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8
                    }}
                  />
                }
                actions={[
                  <EditOutlined 
                  key="edit"
                  onClick={() => handleEditClick(coupon)} 
                  style={{ fontSize: 16 }}
                />,
                  <Popconfirm
                    title="确定删除此优惠券？"
                    onConfirm={() => handleDelete(coupon.couponId)}
                  >
                    <DeleteOutlined />
                  </Popconfirm>
                ]}
              >
                <div style={{ padding: 8 }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <Image
                      src={coupon.iconUrl}
                      width={40}
                      preview={false}
                      style={{ 
                        borderRadius: 4,
                        marginRight: 8
                      }}
                    />
                    <h4 style={{ margin: 0 }}>{coupon.packageName}</h4>
                    <Tag 
                      color={moment().isAfter(coupon.endTime) ? 'red' : 'green'}
                      style={{ marginLeft: 'auto' }}
                    >
                      {moment().isAfter(coupon.endTime) ? '已过期' : '进行中'}
                    </Tag>
                  </div>

                  <div style={{ margin: '12px 0' }}>
                    <span style={{ 
                     textDecoration: 'line-through',
                     color: '#999',
                     marginRight: 8
                    }}>
                      ¥{coupon.originalPrice}
                    </span>
                    <span style={{ 
                      
                      color: '#ff4d4f',
                     fontSize: 18,
                     fontWeight: 'bold'
                      
                    }}>
                      ¥{coupon.discountPrice}
                    </span>
                  </div>

                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#666',
                    fontSize: 12
                  }}>
                    <span>套餐名称：{coupon.title}</span>
                    <span>剩余: {coupon.remainingCount}</span>
                    <span>总量: {coupon.totalCount}</span>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
        
        <CouponEditModal
          visible={editModalVisible}
          couponData={currentCoupon}
          activityId={activityId}
          onCancel={() => {
            setEditModalVisible(false);
            setCurrentCoupon(null);
          }}
          onSuccess={() => {
            dispatch(fetchCoupons(activityId));
            setEditModalVisible(false);
          }}
        />
        <CouponAdd
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          activityId={activityId}
          initialValues={currentCoupon}
          onSuccess={() => dispatch(fetchCoupons(activityId))}
        />
      </div>
    </div>
  );
};

export default CouponManager;