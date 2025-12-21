from fastapi import APIRouter

from .v1.storefront import router

# V1 router
api_v1_router = APIRouter()
api_v1_router.include_router(router)
