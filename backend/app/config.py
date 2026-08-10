import os
from dotenv import load_dotenv

load_dotenv()

APP_NAME=os.getenv(
    "APP_NAME",
    "Elespa Intelligent Digital Twin"
)
APP_VERSION=os.getenv(
    "APP_VERSION",
    "1.0.0"
)
ENVIRONMENT=os.getenv(
    "ENVIRONMENT",
    "development"
)