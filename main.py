from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from fastapi_profiler.profiler_middleware import PyInstrumentProfilerMiddleware
from src.endpoints.router_v1 import api_v1_router


# main
def get_application():
    """
    Get FastAPI Application for service.
    """
    app = FastAPI(title="EDU-TECH service", version="001")

    ALLOWED_HOSTS = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_HOSTS,
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    # Base.metadata.create_all(bind=engine)
    app.include_router(api_v1_router, prefix="/edu/v1")
    return app


app = get_application()


@app.get("/", description="***** Liveliness Check *****")
async def root():
    """Root API for EDU-TECH Service testing.
    Returns:
        obj: Response Obj (Application Declaratives)
    """
    response_dict = {
        "project": "EDU-TECH-Service",
        "version": "1.0.0",
        "production_mode": "DEV",
        "documentation": "http://localhost:8000/docs",
        "api_endpoint": None,
        "contact_email": "gauravbackeddev@gmail.com",
    }
    return response_dict
