// src/components/settings/NotificationSettingsModal.js

import React, { useState, useEffect } from 'react';
import { 
  X, Bell, Mail, MessageSquare, ShoppingBag, 
  Gift, Star, Volume2, VolumeX, Smartphone,
  Clock, Toggle, CheckCircle, Settings
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/NotificationSettingsModal.css';

const NotificationSettingsModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUpdateSettings, 
  loading = false 
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    email: {
      marketing: true,
      order: true,
      review: true,
      event: false,
      newsletter: true
    },
    sms: {
      marketing: false,
      order: true,
      review: false,
      event: false,
      delivery: true
    },
    push: {
      marketing: true,
      order: true,
      review: true,
      event: true,
      chat: true
    },
    sound: {
      enabled: true,
      volume: 70
    },
    schedule: {
      enabled: true,
      startTime: '09:00',
      endTime: '22:00'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // 사용자 설정 로드
      loadUserSettings();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadUserSettings = () => {
    // 실제로는 사용자의 알림 설정을 API에서 가져옴
    const savedSettings = localStorage.getItem(`notification-settings-${user?.id}`);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
    }
    setHasChanges(false);
  };

  const handleSettingChange = (category, type, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      // 실제로는 백엔드 API 호출
      localStorage.setItem(`notification-settings-${user?.id}`, JSON.stringify(settings));
      await onUpdateSettings(settings);
      
      toast.success('알림 설정이 저장되었습니다!', {
        kirbyStyle: true
      });
      setHasChanges(false);
    } catch (error) {
      toast.error('설정 저장 중 오류가 발생했습니다.');
    }
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      email: {
        marketing: true,
        order: true,
        review: true,
        event: false,
        newsletter: true
      },
      sms: {
        marketing: false,
        order: true,
        review: false,
        event: false,
        delivery: true
      },
      push: {
        marketing: true,
        order: true,
        review: true,
        event: true,
        chat: true
      },
      sound: {
        enabled: true,
        volume: 70
      },
      schedule: {
        enabled: true,
        startTime: '09:00',
        endTime: '22:00'
      }
    };
    
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.info('기본 설정으로 초기화되었습니다.');
  };

  if (!isOpen) return null;

  const notificationTypes = [
    {
      key: 'marketing',
      icon: Gift,
      title: '마케팅 정보',
      description: '할인쿠폰, 이벤트, 신상품 소식'
    },
    {
      key: 'order',
      icon: ShoppingBag,
      title: '주문/배송',
      description: '주문 확인, 배송 상태, 배송 완료'
    },
    {
      key: 'review',
      icon: Star,
      title: '리뷰/평점',
      description: '리뷰 작성 요청, 도움이 되었다는 알림'
    },
    {
      key: 'event',
      icon: Gift,
      title: '이벤트',
      description: '특별 이벤트, 한정 상품, 타임세일'
    },
    {
      key: 'newsletter',
      icon: Mail,
      title: '뉴스레터',
      description: '주간 소식, 추천 상품, 트렌드 정보',
      emailOnly: true
    },
    {
      key: 'delivery',
      icon: ShoppingBag,
      title: '배송 알림',
      description: '배송 출발, 배송 완료 SMS',
      smsOnly: true
    },
    {
      key: 'chat',
      icon: MessageSquare,
      title: '채팅/문의',
      description: '고객센터 답변, 1:1 문의 답변',
      pushOnly: true
    }
  ];

  return (
    <div className="nsm-modal-overlay" onClick={onClose}>
      <div className="nsm-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="nsm-header">
          <div className="nsm-header-content">
            <Bell className="nsm-header-icon" size={24} />
            <div>
              <h2>알림 설정</h2>
              <p>원하는 알림만 받아보세요</p>
            </div>
          </div>
          <button className="nsm-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="nsm-content">
          {/* 알림 방식별 설정 */}
          <div className="nsm-channels">
            {/* 이메일 알림 */}
            <div className="nsm-channel-section">
              <div className="nsm-channel-header">
                <Mail className="nsm-channel-icon" size={20} />
                <h3>이메일 알림</h3>
                <span className="nsm-channel-desc">{user?.email}</span>
              </div>
              
              <div className="nsm-notification-list">
                {notificationTypes
                  .filter(type => !type.smsOnly && !type.pushOnly)
                  .map(type => {
                    const Icon = type.icon;
                    return (
                      <div key={type.key} className="nsm-notification-item">
                        <div className="nsm-notification-info">
                          <Icon className="nsm-notification-icon" size={18} />
                          <div>
                            <h4>{type.title}</h4>
                            <p>{type.description}</p>
                          </div>
                        </div>
                        <label className="nsm-toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.email[type.key] || false}
                            onChange={(e) => handleSettingChange('email', type.key, e.target.checked)}
                          />
                          <span className="nsm-toggle-slider"></span>
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* SMS 알림 */}
            <div className="nsm-channel-section">
              <div className="nsm-channel-header">
                <Smartphone className="nsm-channel-icon" size={20} />
                <h3>SMS 알림</h3>
                <span className="nsm-channel-desc">{user?.phone || '전화번호 미등록'}</span>
              </div>
              
              <div className="nsm-notification-list">
                {notificationTypes
                  .filter(type => !type.emailOnly && !type.pushOnly)
                  .map(type => {
                    const Icon = type.icon;
                    return (
                      <div key={type.key} className="nsm-notification-item">
                        <div className="nsm-notification-info">
                          <Icon className="nsm-notification-icon" size={18} />
                          <div>
                            <h4>{type.title}</h4>
                            <p>{type.description}</p>
                          </div>
                        </div>
                        <label className="nsm-toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.sms[type.key] || false}
                            onChange={(e) => handleSettingChange('sms', type.key, e.target.checked)}
                            disabled={!user?.phone}
                          />
                          <span className="nsm-toggle-slider"></span>
                        </label>
                      </div>
                    );
                  })}
              </div>
              
              {!user?.phone && (
                <div className="nsm-channel-notice">
                  <p>SMS 알림을 받으시려면 전화번호를 등록해주세요.</p>
                </div>
              )}
            </div>

            {/* 푸시 알림 */}
            <div className="nsm-channel-section">
              <div className="nsm-channel-header">
                <Bell className="nsm-channel-icon" size={20} />
                <h3>푸시 알림</h3>
                <span className="nsm-channel-desc">브라우저 알림</span>
              </div>
              
              <div className="nsm-notification-list">
                {notificationTypes
                  .filter(type => !type.emailOnly && !type.smsOnly)
                  .map(type => {
                    const Icon = type.icon;
                    return (
                      <div key={type.key} className="nsm-notification-item">
                        <div className="nsm-notification-info">
                          <Icon className="nsm-notification-icon" size={18} />
                          <div>
                            <h4>{type.title}</h4>
                            <p>{type.description}</p>
                          </div>
                        </div>
                        <label className="nsm-toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.push[type.key] || false}
                            onChange={(e) => handleSettingChange('push', type.key, e.target.checked)}
                          />
                          <span className="nsm-toggle-slider"></span>
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* 추가 설정 */}
          <div className="nsm-additional-settings">
            {/* 사운드 설정 */}
            <div className="nsm-setting-section">
              <div className="nsm-setting-header">
                <Volume2 className="nsm-setting-icon" size={20} />
                <h3>사운드 설정</h3>
              </div>
              
              <div className="nsm-setting-content">
                <div className="nsm-setting-item">
                  <div className="nsm-setting-info">
                    <h4>알림 사운드</h4>
                    <p>푸시 알림 시 소리를 재생합니다</p>
                  </div>
                  <label className="nsm-toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.sound.enabled}
                      onChange={(e) => handleSettingChange('sound', 'enabled', e.target.checked)}
                    />
                    <span className="nsm-toggle-slider"></span>
                  </label>
                </div>
                
                {settings.sound.enabled && (
                  <div className="nsm-setting-item">
                    <div className="nsm-setting-info">
                      <h4>볼륨</h4>
                      <p>알림 소리 크기: {settings.sound.volume}%</p>
                    </div>
                    <div className="nsm-volume-control">
                      <VolumeX size={16} />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.sound.volume}
                        onChange={(e) => handleSettingChange('sound', 'volume', parseInt(e.target.value))}
                        className="nsm-volume-slider"
                      />
                      <Volume2 size={16} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 시간 설정 */}
            <div className="nsm-setting-section">
              <div className="nsm-setting-header">
                <Clock className="nsm-setting-icon" size={20} />
                <h3>알림 시간 설정</h3>
              </div>
              
              <div className="nsm-setting-content">
                <div className="nsm-setting-item">
                  <div className="nsm-setting-info">
                    <h4>방해 금지 모드</h4>
                    <p>지정한 시간에만 알림을 받습니다</p>
                  </div>
                  <label className="nsm-toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.schedule.enabled}
                      onChange={(e) => handleSettingChange('schedule', 'enabled', e.target.checked)}
                    />
                    <span className="nsm-toggle-slider"></span>
                  </label>
                </div>
                
                {settings.schedule.enabled && (
                  <div className="nsm-time-range">
                    <div className="nsm-time-input">
                      <label>시작 시간</label>
                      <input
                        type="time"
                        value={settings.schedule.startTime}
                        onChange={(e) => handleSettingChange('schedule', 'startTime', e.target.value)}
                      />
                    </div>
                    <span className="nsm-time-separator">~</span>
                    <div className="nsm-time-input">
                      <label>종료 시간</label>
                      <input
                        type="time"
                        value={settings.schedule.endTime}
                        onChange={(e) => handleSettingChange('schedule', 'endTime', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 빠른 설정 */}
          <div className="nsm-quick-settings">
            <h3>빠른 설정</h3>
            <div className="nsm-quick-buttons">
              <button 
                className="nsm-quick-btn all-on"
                onClick={() => {
                  const allOnSettings = {
                    ...settings,
                    email: Object.keys(settings.email).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
                    sms: Object.keys(settings.sms).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
                    push: Object.keys(settings.push).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                  };
                  setSettings(allOnSettings);
                  setHasChanges(true);
                }}
              >
                <CheckCircle size={16} />
                모든 알림 켜기
              </button>
              
              <button 
                className="nsm-quick-btn essential-only"
                onClick={() => {
                  const essentialSettings = {
                    ...settings,
                    email: { marketing: false, order: true, review: false, event: false, newsletter: false },
                    sms: { marketing: false, order: true, review: false, event: false, delivery: true },
                    push: { marketing: false, order: true, review: false, event: false, chat: true }
                  };
                  setSettings(essentialSettings);
                  setHasChanges(true);
                }}
              >
                <Bell size={16} />
                필수 알림만
              </button>
              
              <button 
                className="nsm-quick-btn reset"
                onClick={handleResetSettings}
              >
                <Settings size={16} />
                기본값으로
              </button>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="nsm-footer">
          <div className="nsm-footer-info">
            <p>
              알림 설정은 언제든지 변경할 수 있으며, 
              마케팅 정보 수신 거부는 각 이메일 하단의 링크를 통해서도 가능합니다.
            </p>
          </div>
          <div className="nsm-footer-actions">
            <button 
              className="nsm-cancel-button" 
              onClick={onClose}
            >
              취소
            </button>
            <button 
              className={`nsm-save-button ${hasChanges ? 'has-changes' : ''}`}
              onClick={handleSaveSettings}
              disabled={!hasChanges || loading}
            >
              {loading ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;