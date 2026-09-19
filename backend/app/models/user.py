from pydantic import BaseModel, EmailStr , Field ,field_validator
# Creating model for validating the user details
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = Field(
        pattern=r"^[6-9]\d{9}$")
    password: str = Field(
        min_length=8,
        max_length=32,
       
    )
    role: str
    latitude: float
    longitude: float
# validating the password with fieldvalidator as lookahead is not supported in pydanticv2
    @field_validator("password")
    @classmethod
    def validate_password(cls, password):
        if not any(c.isupper() for c in password):
            raise ValueError("Password must contain an uppercase letter")

        if not any(c.islower() for c in password):
            raise ValueError("Password must contain a lowercase letter")

        if not any(c.isdigit() for c in password):
            raise ValueError("Password must contain a number")

        if not any(not c.isalnum() for c in password):
            raise ValueError("Password must contain a special character")
