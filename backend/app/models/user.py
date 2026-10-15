
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(pattern=r"^[6-9]\d{9}$")
    password: str = Field(min_length=8, max_length=32)
    role: str = "customer"
    latitude: float
    longitude: float

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        if not any(c.isupper() for c in password):
            raise ValueError("Password must contain an uppercase letter")

        if not any(c.islower() for c in password):
            raise ValueError("Password must contain a lowercase letter")

        if not any(c.isdigit() for c in password):
            raise ValueError("Password must contain a number")

        if not any(not c.isalnum() for c in password):
            raise ValueError("Password must contain a special character")

        return password

    @field_validator("role")
    @classmethod
    def validate_role(cls, role: str) -> str:
        allowed_roles = {"customer", "worker"}
        role = role.strip().lower()

        if role not in allowed_roles:
            raise ValueError("Role must be customer or worker")

        return role

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, value: float) -> float:
        if not -90 <= value <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return value

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, value: float) -> float:
        if not -180 <= value <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str
