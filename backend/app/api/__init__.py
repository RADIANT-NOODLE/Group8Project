from .properties import router as properties_router
from .complaints import router as complaints_router
from .users import router as users_router
from .providers import router as providers_router
from .sales import router as sales_router
from .reviews import router as reviews_router
from .listings import router as listings_router
from .announcements import router as announcements_router
from .work_orders import router as work_orders_router
from .ai_analytics import router as ai_analytics_router
from .sessions import router as sessions_router
from .login_attempts import router as login_attempts_router

__all__ = [
    'properties_router', 
    'complaints_router', 
    'users_router', 
    'providers_router',
    'sales_router',
    'reviews_router',
    'listings_router',
    'announcements_router',
    'work_orders_router',
    'ai_analytics_router',
    'sessions_router',
    'login_attempts_router'
    ]
