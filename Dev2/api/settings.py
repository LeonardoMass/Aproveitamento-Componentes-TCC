from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv
import json

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

allowed_hosts_str = os.environ.get('ALLOWED_HOSTS', '')
ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_str.split(',') if host.strip()]

cors_origins_str = os.environ.get('CORS_ALLOWED_ORIGINS', '')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins_str.split(',') if origin.strip()]

csrf_trusted_origins_str = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_trusted_origins_str.split(',') if origin.strip()]

FRONTEND_URL = os.environ.get('FRONTEND_URL')
GOOGLE_OAUTH2_CLIENT_ID = os.environ.get('GOOGLE_OAUTH2_CLIENT_ID')
GOOGLE_OAUTH2_CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH2_CLIENT_SECRET')
GOOGLE_OAUTH2_REDIRECT_URI = os.environ.get('GOOGLE_OAUTH2_REDIRECT_URI')
AUTH_FRONTEND_URL = os.environ.get('AUTH_FRONTEND_URL')
AUTH_ERROR_FRONTEND_URL = os.environ.get('AUTH_ERROR_FRONTEND_URL')
google_scope_str = os.environ.get('GOOGLE_OAUTH2_SCOPE', '')
GOOGLE_OAUTH2_SCOPE = [scope.strip() for scope in google_scope_str.split(',') if scope.strip()]

GOOGLE_DRIVE_FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')
google_service_creds_json_str = os.environ.get('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON', '{}')
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON = json.loads(google_service_creds_json_str)
google_drive_scope_str = os.environ.get('GOOGLE_DRIVE_OAUTH2_SCOPE', '')
GOOGLE_DRIVE_OAUTH2_SCOPE = [scope.strip() for scope in google_drive_scope_str.split(',') if scope.strip()]

GMAIL_SENDER_CLIENT_ID = os.environ.get('GMAIL_SENDER_CLIENT_ID')
GMAIL_SENDER_CLIENT_SECRET = os.environ.get('GMAIL_SENDER_CLIENT_SECRET')
GMAIL_SENDER_REFRESH_TOKEN = os.environ.get('GMAIL_SENDER_REFRESH_TOKEN')

CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'users',
    'api',
    'corsheaders',
    'polymorphic',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'api.urls'

CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'x-csrftoken',
    'x-requested-with',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'api.wsgi.application'

DATABASE_URL = os.environ.get('DATABASE_URL', f'sqlite:///{BASE_DIR / "banco.sqlite3"}')
DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL)
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'EXCEPTION_HANDLER': 'api.utils.custom_exception_handler.custom_exception_handler',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

if DEBUG:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
