"""The API's entry point on AWS Lambda. Locally it is still run with uvicorn."""
from mangum import Mangum

from app.main import app

# Lambda has no start-up or shut-down stage to run the app's lifespan events in.
handler = Mangum(app, lifespan="off")
