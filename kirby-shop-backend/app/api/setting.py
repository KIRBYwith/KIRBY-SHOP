from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database import get_db
from app.services.setting_service import SettingService
from app.schemas.setting import SettingCreate, SettingUpdate, SettingsBulkUpdate, SettingResponse
from app.api.auth import get_current_admin_user

router = APIRouter()

@router.get("/settings", response_model=Dict[str, Any])
async def get_all_settings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """모든 설정값 조회"""
    try:
        setting_service = SettingService(db)
        settings = setting_service.get_all_settings()
        return {"success": True, "data": settings}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"설정 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/settings/category/{category}", response_model=Dict[str, Any])
async def get_settings_by_category(
    category: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """카테고리별 설정값 조회"""
    try:
        setting_service = SettingService(db)
        settings = setting_service.get_settings_by_category(category)
        return {"success": True, "data": settings}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"설정 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/settings/key/{setting_key}", response_model=Dict[str, Any])
async def get_setting_by_key(
    setting_key: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """키로 설정값 조회"""
    try:
        setting_service = SettingService(db)
        value = setting_service.get_setting_value(setting_key)
        return {"success": True, "data": {setting_key: value}}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"설정 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/settings/key/{setting_key}", response_model=Dict[str, Any])
async def update_setting_value(
    setting_key: str,
    value: Any,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """설정값 업데이트"""
    try:
        setting_service = SettingService(db)
        result = setting_service.update_setting_value(setting_key, value)
        if result:
            return {"success": True, "message": "설정이 업데이트되었습니다."}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 설정을 찾을 수 없습니다."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"설정 업데이트 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/settings/bulk", response_model=Dict[str, Any])
async def bulk_update_settings(
    settings_data: SettingsBulkUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """여러 설정값 일괄 업데이트"""
    try:
        setting_service = SettingService(db)
        results = setting_service.bulk_update_settings(settings_data.settings)
        
        success_count = sum(1 for success in results.values() if success)
        total_count = len(results)
        
        return {
            "success": True,
            "message": f"{success_count}/{total_count}개 설정이 업데이트되었습니다.",
            "results": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"설정 일괄 업데이트 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/settings/site-info", response_model=Dict[str, Any])
async def get_site_info(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """사이트 정보 조회"""
    try:
        setting_service = SettingService(db)
        site_info = setting_service.get_site_info()
        return {"success": True, "data": site_info}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사이트 정보 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/settings/operation", response_model=Dict[str, Any])
async def get_operation_settings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """운영 설정 조회"""
    try:
        setting_service = SettingService(db)
        operation_settings = setting_service.get_operation_settings()
        return {"success": True, "data": operation_settings}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"운영 설정 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/settings/design", response_model=Dict[str, Any])
async def get_design_settings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """디자인 설정 조회"""
    try:
        setting_service = SettingService(db)
        design_settings = setting_service.get_design_settings()
        return {"success": True, "data": design_settings}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"디자인 설정 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/settings/security", response_model=Dict[str, Any])
async def get_security_settings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """보안 설정 조회"""
    try:
        setting_service = SettingService(db)
        security_settings = setting_service.get_security_settings()
        return {"success": True, "data": security_settings}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"보안 설정 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/settings/reset", response_model=Dict[str, Any])
async def reset_settings_to_default(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """설정값을 기본값으로 초기화"""
    try:
        # 기본 설정값들
        default_settings = {
            'site_name': '커비샵',
            'site_description': '커비 굿즈 전문 쇼핑몰',
            'site_tagline': '귀여운 커비와 함께하는 특별한 쇼핑',
            'company_name': '커비샵 주식회사',
            'ceo_name': '김커비',
            'business_number': '123-45-67890',
            'company_address': '서울특별시 강남구 테헤란로 123',
            'customer_phone': '1588-1234',
            'admin_email': 'admin@kirby-shop.com',
            'operating_hours_start': '09:00',
            'operating_hours_end': '18:00',
            'default_language': 'ko',
            'default_region': 'KR',
            'maintenance_mode': False,
            'allow_signup': True,
            'email_verification': True,
            'phone_verification': False,
            'member_level_normal_discount': 0,
            'member_level_vip_discount': 5,
            'member_level_vvip_discount': 10,
            'user_management': True,
            'product_management': True,
            'order_management': True,
            'system_settings': True,
            'blocked_ips': '',
            'allowed_countries': ['KR'],
            'block_vpn': False,
            'site_theme': 'kirby-pink',
            'main_color': '#ff69b4',
            'secondary_color': '#ff1493',
            'show_hero_banner': True,
            'show_promo_banner': True,
            'products_per_page': 24,
            'sort_by': 'newest',
            'posts_per_page': 20,
            'allow_comments': True,
            'require_login': False,
            'auto_approve': True,
            'pg_provider': 'toss',
            'merchant_id': '',
            'merchant_key': '',
            'test_mode': True,
            'default_domain': 'kirby-shop.com',
            'sub_domain': '',
            'ssl_enabled': True,
            'www_redirect': False,
            'email_service': 'smtp',
            'google_login': False,
            'kakao_login': True,
            'naver_login': False,
            'chat_service': 'kakao',
            'captcha_enabled': False,
            'session_timeout': 24,
            'two_factor_auth': False,
            'login_logging': True,
            'password_policy': True,
            'backup_schedule': 'weekly',
            'backup_retention': 30,
            'server_monitoring': True,
            'traffic_monitoring': True,
            'error_alerts': True,
            'alert_email': 'admin@kirby-shop.com'
        }
        
        setting_service = SettingService(db)
        results = setting_service.bulk_update_settings(default_settings)
        
        success_count = sum(1 for success in results.values() if success)
        total_count = len(results)
        
        return {
            "success": True,
            "message": f"{success_count}/{total_count}개 설정이 기본값으로 초기화되었습니다.",
            "results": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"설정 초기화 중 오류가 발생했습니다: {str(e)}"
        )

