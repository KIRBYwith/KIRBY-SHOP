from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SettingBase(BaseModel):
    setting_key: str
    setting_value: Optional[str] = None
    setting_type: str = 'string'
    category: str = 'general'
    description: Optional[str] = None
    is_active: bool = True

class SettingCreate(SettingBase):
    pass

class SettingUpdate(BaseModel):
    setting_value: Optional[str] = None
    setting_type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SettingResponse(SettingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SettingsBulkUpdate(BaseModel):
    settings: Dict[str, Any]

class SettingsByCategory(BaseModel):
    category: str
    settings: Dict[str, Any]

