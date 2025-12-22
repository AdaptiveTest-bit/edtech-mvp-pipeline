# from typing import Optional

# from pydantic import BaseSettings, EmailStr
# from starlette.config import Config

# config = Config("edu.env")


# class Settings(BaseSettings):
#     """System Settings file for app configuration.

#     Args:
#         BaseSettings (object): Abstract base settings.
#     """

#     # project declarative.
#     project_name: str = config("PROJECT_NAME", cast=str, default="EDU-TECH-Service")
#     version: str = config("VERSION", cast=str, default="1.0.0")
#     app_domain: str = config("APP_DOMAIN", cast=str, default="localhost")
#     app_port: str = config("APP_PORT", cast=str, default="8000")
#     # api_prefix: str = config("API_PREFIX", cast=str, default="/api")
#     # docs_prefix: str = config("DOCS_PREFIX", cast=str, default="/docs")
#     # admin_email: EmailStr = config(
#     #     "APP_ADMIN_EMAIL", cast=EmailStr, default="admin@gmail.com"
#     # )
#     # root_url: str = config(
#     #     "ROOT_URL", cast=str, default=f"http://{ app_domain }:{ app_port }"
#     # )
#     # active_profiler: bool = config("ACTIVE_PROFILER", cast=bool, default=False)
#     # min_compression: int = config("MIN_COMPRESSION", cast=int, default=50)

#     # app settings.
#     allowed_hosts: str = config("ALLOWED_HOSTS", cast=str, default="*")
#     environment: str = config("ENVIRONMENT", cast=str, default="DEV")
#     workers_func: int = config("WORKERS_THREAD", cast=int, default=8)

#     # Database setting
#     # RDS_DB_USERNAME: str = config("RDS_DB_USERNAME", cast=str, default="")
#     # RDS_DB_PASSWORD: str = config("RDS_DB_PASSWORD", cast=str, default="")
#     # # RDS_DB_PORT: str = config(
#     # #     "RDS_DB_PORT", cast=str, default=""
#     # )
#     # RDS_DB_NAME: str = config("RDS_DB_NAME", cast=str, default="")
#     # RDS_DB_HOST: str = config("RDS_DB_HOST", cast=str, default="")
    




# class ProdSettings(Settings):
#     debug: bool = False


# class DevSettings(Settings):
#     debug: bool = True


# class TestSettings(Settings):
#     debug: bool = True
#     testing: bool = True
#     db_force_rollback: bool = True


# class FactoryConfig:
#     """
#     Returns a config instance depends on the ENV_STATE variable.
#     """

#     def __init__(self, environment: Optional[str] = "DEV"):
#         self.environment = environment

#     def __call__(self):
#         if self.environment == "PROD":
#             return ProdSettings()
#         elif self.environment == "TEST":
#             return TestSettings()
#         elif self.environment == "DEV":
#             return DevSettings()


# def get_app_settings():
#     return FactoryConfig(Settings().environment)()
