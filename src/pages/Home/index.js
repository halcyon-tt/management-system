import React, { useState, useEffect } from 'react';
import { Button, Table, Upload, message, Space, Form, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { UploadOutlined, NotificationOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdvertisements,
  insertAdvertisement,
  deleteAdvertisement,
  uploadAdvertisement,
} from '../../store/modules/advertisementSlice';
import { getAnnouncement, updateAnnouncement } from '../../store/modules/annoucementSlice';
import './Home.scss';

const checkVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      if (video.duration > 5) {
        reject('视频长度不能超过 5 秒！');
      } else {
        resolve();
      }
    };
  });
};

const Home = () => {
  const dispatch = useDispatch();
  const { 
    advertisements = [], 
    uploadLoading,
    error 
  } = useSelector((state) => state.advertisement || {});
  
  const { 
    content: announcementContent,
    loading: announcementLoading,
    error: announcementError,
    announcementId,
  } = useSelector((state) => state.announcement || {});
  
  const [posterFileList, setPosterFileList] = useState([]);
  const [currentActivity, setCurrentActivity] = useState({ 
    poster: '',
    type: '',
  });
  const [localAnnouncement, setLocalAnnouncement] = useState('');
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAdvertisements());
    dispatch(getAnnouncement());
  }, [dispatch]);

  useEffect(() => {
    setLocalAnnouncement(announcementContent || '');
  }, [announcementContent]);

  const handleSaveAnnouncement = async () => {
    if (!localAnnouncement.trim()) {
      message.warning('公告内容不能为空！');
      return;
    }
    try {
      await dispatch(updateAnnouncement({
        announcementId: announcementId, 
        content: localAnnouncement,
      }));
      message.success('公告更新成功');
    } catch (error) {
      message.error(`公告更新失败: ${error.message}`);
    }
  };

  const validateForm = () => {
    if (!currentActivity.poster) {
      message.error('请上传广告内容！');
      return false;
    }
    return true;
  };

  const handleFileUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      message.error('只能上传图片或视频文件！');
      return false;
    }

    if (isVideo) {
      try {
        await checkVideoDuration(file);
      } catch (error) {
        message.error(error);
        return false;
      }
    }

    const formData = new FormData();
    formData.append('poster', file);
    try {
      const response = await dispatch(uploadAdvertisement(formData));
      const poster = response.payload;
      const fileType = isImage ? 'image' : 'video';
      setCurrentActivity({
        poster: poster,
        type: fileType
      });
      setPosterFileList([file]);
      message.success('文件上传成功！');
    } catch (error) {
      message.error('文件上传失败，请重试！');
    }
    return false;
  };

  const handleAdSubmit = async () => {
    if (!validateForm()) return;

    const adData = {
      imageUrl: currentActivity.poster,
      type: currentActivity.type
    };

    try {
      await dispatch(insertAdvertisement(adData));
      message.success('广告提交成功');
      setPosterFileList([]);
      dispatch(fetchAdvertisements());
    } catch (error) {
      message.error(`广告提交失败: ${error.message}`);
    }
  };

  const handleDelete = async (advertisementId) => {
    try {
      await dispatch(deleteAdvertisement(Number(advertisementId))).unwrap();
      message.success('广告删除成功');
      dispatch(fetchAdvertisements());
    } catch (error) {
      message.error(`广告删除失败: ${error.message}`);
    }
  };

  const columns = [
    {
      title: '媒体内容',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (text, record) => {
        // 添加空值保护
        if (!record) return '-';
        
        return (
          <div className="media-preview">
            {record.type === 'video' ? (
              <video src={text || ''} controls />
            ) : (
              <img src={text || ''} alt="广告" />
            )}
          </div>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
        title="确认删除该广告？"
        onConfirm={() => handleDelete(record.advertisementId)}
        okText="确认"
        cancelText="取消"
      >
        <Button type="link" danger>
          删除
        </Button>
      </Popconfirm>
      ),
    },
  ];

  return ( 
    <div className="home-container">
      <div className="floating-button">
        <Button
          type="primary"
          shape="circle"
          icon={<NotificationOutlined />}
          size="large"
          onClick={() => setIsAnnouncementModalOpen(true)}
        />
      </div>

      {error && <div className="error-alert">加载失败: {error}</div>}

      <div className="management-card">
        <h2 className="card-title">广告管理</h2>
        
        <div className="upload-section">
          <Upload
            fileList={posterFileList}
            onChange={({ fileList }) => setPosterFileList(fileList)}
            beforeUpload={handleFileUpload}
            maxCount={1}
          >
            <Button 
              icon={<UploadOutlined />}
              className="upload-button"
            >
              上传广告
            </Button>
          </Upload>
          <Button 
            type="primary" 
            className="submit-button"
            onClick={handleAdSubmit}
            loading={uploadLoading}
          >
            提交广告
          </Button>
        </div>

        {advertisements.length === 0 ? (
          <div className="empty-state">
            {/* <img src="/empty-state.svg" alt="空状态" /> */}
            <p>暂无广告数据</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={advertisements}
            rowKey="advertisementId"
            pagination={{ 
              pageSize: 3,
              showSizeChanger: false,
              hideOnSinglePage: true
            }}
            className="ad-table"
            bordered
          />
        )}
      </div>

      <Modal
        title="公告管理"
        open={isAnnouncementModalOpen}
        onCancel={() => setIsAnnouncementModalOpen(false)}
        footer={null}
         width="60vw"
        className="announcement-modal"
        style={{ top: 20 }} 
      >
        <Form.Item style={{ flex: 1, minHeight: '50vh' }}>
          <TextArea
           rows={10} 
            value={localAnnouncement}
            onChange={(e) => setLocalAnnouncement(e.target.value)}
            placeholder="请输入公告内容..."
            className="announcement-textarea"
          />
        </Form.Item>
        <div className="modal-footer">
          {announcementError && (
            <div className="error-text">{announcementError}</div>
          )}
          <Space>
            <Button onClick={() => setIsAnnouncementModalOpen(false)}>
              取消
            </Button>
            <Button 
              type="primary" 
              onClick={handleSaveAnnouncement}
              loading={announcementLoading}
              disabled={localAnnouncement === announcementContent}
            >
              保存公告
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default Home;