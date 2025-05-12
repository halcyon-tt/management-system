// CouponEditModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { updateCoupon } from '../../store/modules/couponSlice';
import { uploadActivityFile } from '../../store/modules/activitySlice';
import { message } from 'antd';

const CouponEditModal = ({ 
  visible, 
  onCancel, 
  couponData,
  activityId,
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [posterFileList, setPosterFileList] = useState([]);
  const [iconFileList, setIconFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentActivity, setCurrentActivity] = useState({
      title:'',
      condition:'', 
      payValue: null,
      actualValue: null,
      stock:null,
      activityName:'', 
      storeName: '',
      posterUrl: '',
      iconUrl: '',
      detail:'',
      initialQuantity:null,
      activityId  
      });
  // 初始化数据（关键逻辑）
  useEffect(() => {
    if (visible && couponData) {
      // 设置表单值
      form.setFieldsValue({
        title: couponData.title,
        condition: couponData.condition,
        actualValue: couponData.originalPrice,
        detail:couponData.detail,
        payValue: couponData.discountPrice,
        // stock: couponData.totalCount,
        initialQuantity:couponData.totalCount,
        timeRange: [
          moment(couponData.beginTime),
          moment(couponData.endTime)
        ]
      });
      setCurrentActivity({
        ...couponData,
        actualValue: couponData.originalPrice,
        payValue: couponData.discountPrice,
        detail: couponData.detail 
      });
      // 初始化文件列表（确保数组格式）
      setPosterFileList(
        couponData.posterUrl 
          ? [{ 
              uid: '-1', 
              name: 'poster',
              status: 'done', 
              url: couponData.posterUrl 
            }] 
          : []
      );

      setIconFileList(
        couponData.iconUrl 
          ? [{ 
              uid: '-2', 
              name: 'icon',
              status: 'done', 
              url: couponData.iconUrl 
            }] 
          : []
      );
    }
  }, [visible, couponData, form]);

  // 文件上传处理（复用Add逻辑）
   const handleMediaUpload = async (file) => {
    
      
          // 创建 FormData 对象
          const formData = new FormData();
          formData.append('poster', file); // 文件字段
      
          try {
            // 调用上传接口
            const response = await dispatch(uploadActivityFile(formData)); // 使用 Redux action
            const posterUrl = response.payload; // 假设后端返回文件 URL
      
            // 更新活动数据
            setCurrentActivity((prev) => ({ ...prev, posterUrl: posterUrl })); // 更新 poster 字段
            setPosterFileList([file]);
            message.success('文件上传成功！');
          } catch (error) {
            message.error('文件上传失败，请重试！');
          }
      
          return false; // 阻止默认上传行为
        };
      
        const handleIconUpload = async (file) => {
          const isImage = file.type.startsWith('image/');
          if (!isImage) {
            message.error('只能上传图片！');
            return false;
          }
          const formData = new FormData();
          formData.append('poster', file); // 文件字段
          try {
            // 调用上传接口
            const response = await dispatch(uploadActivityFile(formData)); // 使用 Redux action
            const iconUrl = response.payload; // 假设后端返回文件 URL
      
            // 更新活动数据
            setCurrentActivity((prev) => ({ ...prev, iconUrl: iconUrl }));
            setIconFileList([file]);
            message.success('文件上传成功！');
          } catch (error) {
            message.error('文件上传失败，请重试！');
          }
      
          return false; // 阻止默认上传行为
        };
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const updateData = {
        ...values,
        couponId: couponData.couponId, 
        activityId,
        originalPrice: Number(currentActivity.actualValue),
        discountPrice: Number(currentActivity.payValue),
        posterUrl: currentActivity.posterUrl,
        iconUrl: currentActivity.iconUrl,
        condition:currentActivity.condition,
        detail:currentActivity.detail,
        initialQuantity: Number(currentActivity.initialQuantity)||couponData.totalCount,
      };
      console.log(updateData)
      await dispatch(updateCoupon(updateData)).unwrap();
      
      message.success('更新成功');
      onSuccess();
      onCancel();
    } catch (error) {
      message.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="编辑优惠券"
      width={800}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
      wrapClassName="custom-modal" // 自定义样式[6,7](@ref)
    >
      <Form form={form} layout="vertical">
        {/* 不可修改的活动名称字段 */}
        <Form.Item
          label="优惠券标题"
          name="title"
          rules={[{ required: true, message: '请输入优惠券标题' }]}
        >
          <Input placeholder="例:满100减80"   
          value={currentActivity.title}
          onChange={(e) =>
            setCurrentActivity((prev) => ({ ...prev, title: e.target.value }))
          } />
        </Form.Item>
        
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
                   name="initialQuantity"
                   rules={[
                     { required: true, message: '请输入优惠券总数' },
                   ]}
                 >
                    <Input type="number" min={0} step={0.01} prefix="¥" value={currentActivity.initialQuantity}
                    onChange={(e) =>
                     setCurrentActivity((prev) => ({ ...prev, initialQuantity: e.target.value }))
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
                   <Upload  fileList={Array.isArray(posterFileList) ? posterFileList : []}
                     beforeUpload={handleMediaUpload}
                     onRemove={() => {
                       setPosterFileList([]);
                       setCurrentActivity((prev) => ({ ...prev, posterUrl: '' }));
                     }}>
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
                     }}>
                     <Button icon={<UploadOutlined />}>上传图标</Button>
                   </Upload>
                 </Form.Item>
                  <Form.Item
                     label="参与条件"
                     name="condition"
                   rules={[{ required: true, message: '请输入参与条件' }]}
                       >
                  <Input.TextArea rows={2} placeholder="例：本校软件工程专业学生" onChange={(e) =>
                         setCurrentActivity((prev) => ({ ...prev, condition: e.target.value }))
                       }/>
                   </Form.Item>
                    <Form.Item
                        label="详细说明"
                        name="detail"
                        rules={[{ required: true, message: '请输入详细说明' }]}
                    >
                    <Input.TextArea rows={2} onChange={(e) =>
                      setCurrentActivity((prev) => ({ ...prev, detail: e.target.value }))
                          } value={currentActivity.detail}/>
                    </Form.Item>
               </div>
        
      </Form>
    </Modal>
  );
};
export default CouponEditModal