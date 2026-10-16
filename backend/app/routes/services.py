from fastapi import APIRouter, HTTPException
from app.utils.service_catalog import SERVICE_CATEGORIES, SERVICES, get_category, get_service

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("/categories")
def list_categories():
    return {"categories": SERVICE_CATEGORIES}


@router.get("/")
def list_services(category_id: str | None = None):
    if category_id and not get_category(category_id):
        raise HTTPException(status_code=404, detail="Service category not found")
    result = [s for s in SERVICES if not category_id or s["category_id"] == category_id]
    return {"services": result}


@router.get("/{service_id}")
def service_details(service_id: str):
    service = get_service(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"service": service}
