from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.setting import SystemSetting
from app.schemas.setting import SettingCreate, SettingUpdate, SettingsBulkUpdate
from typing import List, Dict, Any, Optional
import json

class SettingService:
    def __init__(self, db: Session):
        self.db = db

    def get_setting_by_key(self, setting_key: str) -> Optional[SystemSetting]:
        """키로 설정값 조회"""
        return self.db.query(SystemSetting).filter(
            and_(
                SystemSetting.setting_key == setting_key,
                SystemSetting.is_active == True
            )
        ).first()

    def get_setting_value(self, setting_key: str, default_value: Any = None) -> Any:
        """설정값을 적절한 타입으로 변환하여 반환"""
        setting = self.get_setting_by_key(setting_key)
        if not setting:
            return default_value

        try:
            if setting.setting_type == 'boolean':
                return setting.setting_value.lower() == 'true'
            elif setting.setting_type == 'number':
                return float(setting.setting_value) if '.' in setting.setting_value else int(setting.setting_value)
            elif setting.setting_type == 'json':
                return json.loads(setting.setting_value)
            else:
                return setting.setting_value
        except (ValueError, json.JSONDecodeError):
            return default_value

    def get_settings_by_category(self, category: str) -> Dict[str, Any]:
        """카테고리별 설정값 조회"""
        settings = self.db.query(SystemSetting).filter(
            and_(
                SystemSetting.category == category,
                SystemSetting.is_active == True
            )
        ).all()
        
        result = {}
        for setting in settings:
            result[setting.setting_key] = self.get_setting_value(setting.setting_key)
        return result

    def get_all_settings(self) -> Dict[str, Any]:
        """모든 설정값 조회"""
        settings = self.db.query(SystemSetting).filter(
            SystemSetting.is_active == True
        ).all()
        
        result = {}
        for setting in settings:
            result[setting.setting_key] = self.get_setting_value(setting.setting_key)
        return result

    def create_setting(self, setting_data: SettingCreate) -> SystemSetting:
        """새 설정 생성"""
        setting = SystemSetting(**setting_data.dict())
        self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def update_setting(self, setting_key: str, setting_data: SettingUpdate) -> Optional[SystemSetting]:
        """설정값 업데이트"""
        setting = self.get_setting_by_key(setting_key)
        if not setting:
            return None

        update_data = setting_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(setting, field, value)

        self.db.commit()
        self.db.refresh(setting)
        return setting

    def update_setting_value(self, setting_key: str, value: Any) -> Optional[SystemSetting]:
        """설정값만 업데이트"""
        setting = self.get_setting_by_key(setting_key)
        if not setting:
            return None

        # 값 타입에 따라 적절히 변환
        if isinstance(value, bool):
            setting.setting_value = str(value).lower()
            setting.setting_type = 'boolean'
        elif isinstance(value, (int, float)):
            setting.setting_value = str(value)
            setting.setting_type = 'number'
        elif isinstance(value, (dict, list)):
            setting.setting_value = json.dumps(value, ensure_ascii=False)
            setting.setting_type = 'json'
        else:
            setting.setting_value = str(value)
            setting.setting_type = 'string'

        self.db.commit()
        self.db.refresh(setting)
        return setting

    def bulk_update_settings(self, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        """여러 설정값 일괄 업데이트"""
        results = {}
        for key, value in settings_data.items():
            result = self.update_setting_value(key, value)
            results[key] = result is not None
        return results

    def delete_setting(self, setting_key: str) -> bool:
        """설정 삭제 (비활성화)"""
        setting = self.get_setting_by_key(setting_key)
        if not setting:
            return False

        setting.is_active = False
        self.db.commit()
        return True

    def get_site_info(self) -> Dict[str, Any]:
        """사이트 정보 조회"""
        return {
            'site_name': self.get_setting_value('site_name', '커비샵'),
            'site_description': self.get_setting_value('site_description', '커비 굿즈 전문 쇼핑몰'),
            'site_tagline': self.get_setting_value('site_tagline', '귀여운 커비와 함께하는 특별한 쇼핑'),
            'company_name': self.get_setting_value('company_name', '커비샵 주식회사'),
            'ceo_name': self.get_setting_value('ceo_name', '김커비'),
            'business_number': self.get_setting_value('business_number', '123-45-67890'),
            'company_address': self.get_setting_value('company_address', '서울특별시 강남구 테헤란로 123'),
            'customer_phone': self.get_setting_value('customer_phone', '1588-1234'),
            'admin_email': self.get_setting_value('admin_email', 'admin@kirby-shop.com')
        }

    def get_operation_settings(self) -> Dict[str, Any]:
        """운영 설정 조회"""
        return {
            'operating_hours_start': self.get_setting_value('operating_hours_start', '09:00'),
            'operating_hours_end': self.get_setting_value('operating_hours_end', '18:00'),
            'default_language': self.get_setting_value('default_language', 'ko'),
            'default_region': self.get_setting_value('default_region', 'KR'),
            'maintenance_mode': self.get_setting_value('maintenance_mode', False)
        }

    def get_design_settings(self) -> Dict[str, Any]:
        """디자인 설정 조회"""
        return {
            'site_theme': self.get_setting_value('site_theme', 'kirby-pink'),
            'main_color': self.get_setting_value('main_color', '#ff69b4'),
            'secondary_color': self.get_setting_value('secondary_color', '#ff1493'),
            'show_hero_banner': self.get_setting_value('show_hero_banner', True),
            'show_promo_banner': self.get_setting_value('show_promo_banner', True),
            'products_per_page': self.get_setting_value('products_per_page', 24),
            'sort_by': self.get_setting_value('sort_by', 'newest')
        }

    def get_security_settings(self) -> Dict[str, Any]:
        """보안 설정 조회"""
        return {
            'captcha_enabled': self.get_setting_value('captcha_enabled', False),
            'session_timeout': self.get_setting_value('session_timeout', 24),
            'two_factor_auth': self.get_setting_value('two_factor_auth', False),
            'login_logging': self.get_setting_value('login_logging', True),
            'password_policy': self.get_setting_value('password_policy', True),
            'blocked_ips': self.get_setting_value('blocked_ips', ''),
            'allowed_countries': self.get_setting_value('allowed_countries', ['KR']),
            'block_vpn': self.get_setting_value('block_vpn', False)
        }

