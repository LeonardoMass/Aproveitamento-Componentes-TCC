# crie uma .env para o backend e um .env.local para frontend

SECRET_KEY='django-insecure-x7wl+2b2u.....3!4&(rk3wfnuh'
DEBUG=True
DATABASE_URL='sqlite:///banco.sqlite3'
ALLOWED_HOSTS='localhost,127.0.0.1,super-spork-49rr5rxx44qhjqrv-8000.app.github.dev,super-spork-49rr5rxx44qhjqrv-3000.app.github.dev'
CORS_ALLOWED_ORIGINS='http://localhost:3000,https://super-spork-49rr5rxx44qhjqrv-3000.app.github.dev'
CSRF_TRUSTED_ORIGINS='https://super-spork-49rr5rxx44qhjqrv-8000.app.github.dev,https://super-spork-49rr5rxx44qhjqrv-3000.app.github.dev'
GOOGLE_OAUTH2_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_OAUTH2_CLIENT_SECRET=""
GOOGLE_OAUTH2_REDIRECT_URI="http://localhost:8000/oauth2callback"
AUTH_FRONTEND_URL="http://localhost:3000/auth?token={token}&data={data}"
AUTH_ERROR_FRONTEND_URL="http://localhost:3000/error"
GOOGLE_OAUTH2_SCOPE="openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile"
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON='{"type": "service_account", "project_id": "extr..."}'
GOOGLE_DRIVE_FOLDER_ID=''
GOOGLE_DRIVE_OAUTH2_SCOPE = "https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/drive.file"
FRONTEND_URL = 'http://localhost:3000'

GMAIL_SENDER_CLIENT_ID=""
GMAIL_SENDER_CLIENT_SECRET=""
GMAIL_SENDER_REFRESH_TOKEN=""

