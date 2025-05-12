// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Form, Input, Button, Upload, message } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
// import { issueCoupon, updateCoupon } from '../../store/modules/couponSlice';
// import { uploadActivityFile } from '../../store/modules/activitySlice';
// import './coupon.scss';

// const { TextArea } = Input;

// const CouponAdd = ({ coupon, onSuccess }) => {
//   const dispatch = useDispatch();
//   const { loading, error, uploadLoading } = useSelector(state => state.coupon);
//   const [form] = Form.useForm();
//   const [posterFileList, setPosterFileList] = useState([]);
//   const [iconFileList, setIconFileList] = useState([]);
//   const [currentActivity, setCurrentActivity] = useState({
//     packageName: '',
//     discountPrice: null,
//     originalPrice: null,
//     posterUrl: '',
//     iconUrl: '',
//     details: '',
//     condition: ''
//     });
//   // 初始化表单值
//   useEffect(() => {
//     if (coupon) {
//       form.setFieldsValue({
//         ...coupon,
//         details: coupon.couponDetails?.details,
//         condition: coupon.couponDetails?.condition
//       });
//       setPosterFileList(coupon.posterUrl ? [{ url: coupon.posterUrl }] : []);
//       setIconFileList(coupon.iconUrl ? [{ url: coupon.iconUrl }] : []);
//     }
//   }, [coupon, form]);
//   const handleMediaUpload = async (file) => {
  
//       // 创建 FormData 对象
//       const formData = new FormData();
//       formData.append('poster', file); // 文件字段
  
//       try {
//         // 调用上传接口
//         const response = await dispatch(uploadActivityFile(formData)); // 使用 Redux action
//         const posterUrl = response.payload; // 假设后端返回文件 URL
  
//         // 更新活动数据
//         setCurrentActivity((prev) => ({ ...prev, posterUrl: posterUrl })); // 更新 poster 字段
//         setPosterFileList([file]);
//         message.success('文件上传成功！');
//       } catch (error) {
//         message.error('文件上传失败，请重试！');
//       }
  
//       return false; // 阻止默认上传行为
//     };
//   // 处理图片上传
//   const handleIconUpload = async (file) => {
//      const isImage = file.type.startsWith('image/');
//      if (!isImage) {
//        message.error('只能上传图片！');
//        return false;
//      }
//      const formData = new FormData();
//      formData.append('poster', file); // 文件字段
//      try {
//        // 调用上传接口
//        const response = await dispatch(uploadActivityFile(formData)); // 使用 Redux action
//        const iconUrl = response.payload; // 假设后端返回文件 URL
 
//        // 更新活动数据
//        setCurrentActivity((prev) => ({ ...prev, iconUrl: iconUrl }));
//        setIconFileList([file]);
//        message.success('文件上传成功！');
//      } catch (error) {
//        message.error('文件上传失败，请重试！');
//      }
 
//      return false; // 阻止默认上传行为
//    };

//   // 上传组件配置
 

//   // 表单提交处理
//   const handleSubmit = async (values) => {
//      const formData = {
//       packageName: currentActivity.packageName,
//       discountPrice: currentActivity.discountPrice,
//       originalPrice: currentActivity.originalPrice,
//       posterUrl: currentActivity.posterUrl,
//       iconUrl: currentActivity.iconUrl,
//       details: currentActivity.details,
//       condition: currentActivity.condition
//         };
//         console.log('formData:', formData);
//         // 提交活动
//         dispatch(issueCoupon(formData));
//         console.log('提交了活动');
    
//         // 重置表单
//         setCurrentActivity({
//           packageName: '',
//           discountPrice: null,
//           originalPrice: null,
//           posterUrl: '',
//           iconUrl: '',
//           details: '',
//           condition: ''
//         });
//         setPosterFileList([]);  // 清除海报文件列表
//         setIconFileList([]);    // 清除图标文件列表
//         message.success('活动已添加！');
//   };

//   return (
//     <Form
//       form={form}
//       layout="vertical"
//       onFinish={handleSubmit}
//       className="coupon-form wide-form"
//       initialValues={{
//         packageName: '',
//         discountPrice: null,
//         originalPrice: null,
//         posterUrl: '',
//         iconUrl: '',
//         details: '',
//         condition: ''
//       }}
//     >
//       {/* 错误提示 */}
//       {error && <div className="error-message">{error}</div>}

//       {/* 套餐名称 */}
//       <Form.Item
//         label="套餐名称"
//         name="packageName"
//         rules={[{ required: true, message: '请输入套餐名称' }]}
//       >
//         <Input placeholder="例：超值午餐套餐" value={currentActivity.packageName}
//          onChange={(e) =>
//           setCurrentActivity((prev) => ({ ...prev, packageName: e.target.value }))
//         }
//         />
//       </Form.Item>

//       {/* 价格组合 */}
//       <div className="inline-group">
//         <Form.Item
//           label="原价"
//           name="originalPrice"
//           rules={[
//             { required: true, message: '请输入原价' },
//             { pattern: /^\d+(\.\d{1,2})?$/, message: '最多保留两位小数' }
//           ]}
//           style={{ flex: 1, marginRight: 16 }}
//         >
//           <Input type="number" min={0} step={0.01} prefix="¥" value={currentActivity.originalPrice} 
//            onChange={(e) =>
//             setCurrentActivity((prev) => ({ ...prev, originalPrice: e.target.value }))
//           }
//           />
//         </Form.Item>

//         <Form.Item
//           label="折扣价"
//           name="discountPrice"
//           rules={[
//             { required: true, message: '请输入折扣价' },
//             ({ getFieldValue }) => ({
//               validator(_, value) {
//                 if (getFieldValue('originalPrice') > value) {
//                   return Promise.resolve();
//                 }
//                 return Promise.reject(new Error('折扣价必须小于原价'));
//               }
//             })
//           ]}
//           style={{ flex: 1 }}
//         >
//           <Input type="number" min={0} step={0.01} prefix="¥" value={currentActivity.discountPrice}
//              onChange={(e) =>
//               setCurrentActivity((prev) => ({ ...prev, discountPrice: e.target.value }))
//             }
//           />
//         </Form.Item>
//       </div>

//       {/* 图片上传 */}
//       <div className="inline-group">
//         <Form.Item
//           label="宣传海报"
//           name="posterUrl"
//           style={{ flex: 1, marginRight: 16 }}
//         >
//           <Upload fileList={posterFileList}
//               beforeUpload={handleMediaUpload}
//               onRemove={() => {
//                 setPosterFileList([]);
//                 setCurrentActivity((prev) => ({ ...prev, posterUrl: '' }));
//               }}>
//             <Button loading={uploadLoading} icon={<UploadOutlined />}>
//               上传海报
//             </Button>
//           </Upload>
//         </Form.Item>

//         <Form.Item
//           label="图标"
//           name="iconUrl"
//           style={{ flex: 1 }}
//         >
//           <Upload fileList={iconFileList}
//               beforeUpload={handleIconUpload}
//               onRemove={() => {
//                 setIconFileList([]);
//                 setCurrentActivity((prev) => ({ ...prev, iconUrl: '' }));
//               }}>
//             <Button loading={uploadLoading} icon={<UploadOutlined />}>
//               上传图标
//             </Button>
//           </Upload>
//         </Form.Item>
//       </div>

//       {/* 套餐详情 */}
//       <Form.Item
//         label="套餐详情"
//         name="details"
//         rules={[{ required: true, message: '请输入套餐详情' }]}
//       >
//         <TextArea rows={3} placeholder="请输入套餐包含的具体内容..." value={currentActivity.details}
//          onChange={(e) =>
//           setCurrentActivity((prev) => ({ ...prev, details: e.target.value }))
//         }
//         />
//       </Form.Item>

//       {/* 购买须知 */}
//       <Form.Item
//         label="购买须知"
//         name="condition"
//         rules={[{ required: true, message: '请输入购买注意事项' }]}
//       >
//         <TextArea rows={3} placeholder="请输入使用规则、有效期等信息..." value={currentActivity.condition}
//          onChange={(e) =>
//           setCurrentActivity((prev) => ({ ...prev, condition: e.target.value }))
//         }
//         />
//       </Form.Item>

//       <Form.Item>
//         <Button
//           type="primary"
//           htmlType="submit"
//           loading={loading}
//           block
//           size="large"
//           className="submit-btn"
//         >
//           {coupon ? '更新套餐' : '创建套餐'}
//         </Button>
//       </Form.Item>
//     </Form>
//   );
// };

// export default CouponAdd;
// CouponFormModal.jsx
import React from 'react';
import { Modal, Form, Input, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { issueCoupon } from '../../store/modules/couponSlice';
import { message } from 'antd';
import { uploadActivityFile } from '../../store/modules/activitySlice';
import { fetchCoupons } from '../../store/modules/couponSlice';

const CouponAdd = ({ 
  visible, 
  onCancel, 
  activityId,
  initialValues 
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [posterFileList, setPosterFileList] = useState([]);
  const [iconFileList, setIconFileList] = useState([]);
  
  const [currentActivity, setCurrentActivity] = useState({
    title: '',
    condition: '', 
    payValue: null,
    actualValue: null,
    stock: null,
    storeName: '',
    posterUrl: '',
    iconUrl: '',
    detail: '',
    activityId: activityId,  // 从路由参数获取的活动ID
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        timeRange: [
          moment(initialValues.beginTime),
          moment(initialValues.endTime)
        ]
      });
      setCurrentActivity(prev => ({
        ...prev,
        ...initialValues,
        activityId: activityId 
      }));
    } else {
      setCurrentActivity(prev => ({
        ...prev,
        activityId: activityId
      }));
    }
  }, [initialValues, activityId]);

  const handleMediaUpload = async (file) => {
    const formData = new FormData();
    formData.append('poster', file);

    try {
      const response = await dispatch(uploadActivityFile(formData));
      const posterUrl = response.payload;
      setCurrentActivity((prev) => ({ ...prev, posterUrl: posterUrl }));
      setPosterFileList([file]);
      message.success('文件上传成功！');
    } catch (error) {
      message.error('文件上传失败，请重试！');
    }

    return false;
  };

  const handleIconUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片！');
      return false;
    }

    const formData = new FormData();
    formData.append('poster', file);

    try {
      const response = await dispatch(uploadActivityFile(formData));
      const iconUrl = response.payload;
      setCurrentActivity((prev) => ({ ...prev, iconUrl: iconUrl }));
      setIconFileList([file]);
      message.success('文件上传成功！');
    } catch (error) {
      message.error('文件上传失败，请重试！');
    }

    return false;
  };

  const handleSubmit = () => {
    const formData = {
      activityId: activityId,
      title: currentActivity.title,
      condition: currentActivity.condition, 
      payValue: currentActivity.payValue,
      actualValue: currentActivity.actualValue,
      stock: currentActivity.stock,
      storeName: currentActivity.storeName,
      posterUrl: currentActivity.posterUrl,
      iconUrl: currentActivity.iconUrl,
      detail: currentActivity.detail,
    };

    dispatch(issueCoupon(formData));
    message.success('活动已添加！');
    
    // 重置表单状态
    setCurrentActivity({
      title: '',
      condition: '',
      payValue: null,
      actualValue: null,
      stock: null,
      storeName: '',
      posterUrl: '',
      iconUrl: '',
      detail: '',
    });
    setPosterFileList([]);
    setIconFileList([]);
    
    // 提交成功后关闭模态框
    onCancel();
    
    // 刷新活动列表
    dispatch(fetchCoupons(activityId));
  };

  return (
    <Modal
      title="新建优惠券"
      width={800}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        {/* 主标题 */}
        <Form.Item
          label="优惠券标题"
          name="title"
          rules={[{ required: true, message: '请输入优惠券标题' }]}
        >
          <Input placeholder="例:满100减80" onChange={(e) =>
            setCurrentActivity((prev) => ({ ...prev, title: e.target.value }))
          } />
        </Form.Item>

        {/* 活动信息 */}
        <div className="form-row">
          <Form.Item
            label="关联店铺"
            name="storeName"
            rules={[{ required: true, message: '请输入关联店铺名称' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="请输入店铺名称" onChange={(e) =>
              setCurrentActivity((prev) => ({ ...prev, storeName: e.target.value }))
            } />
          </Form.Item>
        </div>

        {/* 价格信息 */}
        <div className="form-row">
          <Form.Item
            label="原价"
            name="actualValue"
            rules={[
              { required: true, message: '请输入原价' },
              { 
                pattern: /^(?!0\d)\d+(\.\d{1,2})?$/, 
                message: '请输入有效金额（大于0且最多两位小数）' 
              }
            ]}
          >
            <Input type="number" min={0} step={0.01} prefix="¥" value={currentActivity.actualValue}
              onChange={(e) =>
                setCurrentActivity((prev) => ({ ...prev, actualValue: e.target.value }))
              }
            />
          </Form.Item>

          <Form.Item
            label="券后价"
            name="payValue"
            rules={[
              { required: true, message: '请输入券后价' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const originalPrice = parseFloat(getFieldValue('actualValue'));
                  const discountPrice = parseFloat(value);
                  
                  if (isNaN(originalPrice)) {
                    return Promise.reject(new Error('请先填写原价'));
                  }
                  if (discountPrice >= originalPrice) {
                    return Promise.reject(new Error('券后价必须小于原价'));
                  }
                  if (discountPrice <= 0) {
                    return Promise.reject(new Error('券后价必须大于0'));
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Input type="number" min={0} step={0.01} prefix="¥" value={currentActivity.payValue}
              onChange={(e) =>
                setCurrentActivity((prev) => ({ ...prev, payValue: e.target.value }))
              }
            />
          </Form.Item>

          <Form.Item
            label="优惠券总数"
            name="stock"
            rules={[
              { required: true, message: '请输入优惠券总数' },
            ]}
          >
            <Input type="number" min={0} step={0.01} prefix="¥" value={currentActivity.stock}
              onChange={(e) =>
                setCurrentActivity((prev) => ({ ...prev, stock: e.target.value }))
              }
            />
          </Form.Item>
        </div>

        {/* 图片上传 */}
        <div className="form-row">
          <Form.Item
            label="宣传海报"
            name="posterUrl"
            valuePropName="fileList"
            getValueFromEvent={e => e.fileList}
          >
            <Upload fileList={Array.isArray(posterFileList) ? posterFileList : []}
              beforeUpload={handleMediaUpload}
              onRemove={() => {
                setPosterFileList([]);
                setCurrentActivity((prev) => ({ ...prev, posterUrl: '' }));
              }} >
              <Button icon={<UploadOutlined />}>上传海报</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="优惠券图标"
            name="iconUrl"
            valuePropName="fileList"
            getValueFromEvent={e => e.fileList}
          >
            <Upload fileList={Array.isArray(iconFileList) ? iconFileList : []}
              beforeUpload={handleIconUpload}
              onRemove={() => {
                setIconFileList([]);
                setCurrentActivity((prev) => ({ ...prev, iconUrl: '' }));
              }} >
              <Button icon={<UploadOutlined />}>上传图标</Button>
            </Upload>
          </Form.Item>
        </div>

        {/* 详细信息 */}
        <Form.Item
          label="参与条件"
          name="condition"
          rules={[{ required: true, message: '请输入参与条件' }]}
        >
          <Input.TextArea rows={2} placeholder="例：本校软件工程专业学生" onChange={(e) =>
            setCurrentActivity((prev) => ({ ...prev, condition: e.target.value }))
          } />
        </Form.Item>

        <Form.Item
          label="详细说明"
          name="detail"
          rules={[{ required: true, message: '请输入详细说明' }]}
        >
          <Input.TextArea rows={4} placeholder="例：需要年满十八岁" onChange={(e) =>
            setCurrentActivity((prev) => ({ ...prev, detail: e.target.value }))
          } />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CouponAdd;