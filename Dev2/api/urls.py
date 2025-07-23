from django.contrib import admin
from django.urls import path, include

from .views import GoogleAuthView, GoogleAuthCallbackView, initBackEnd, SendReminderEmailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth-google', GoogleAuthView.as_view(), name='auth_google'),
    path('oauth2callback', GoogleAuthCallbackView.as_view(), name='google_callback'),
    path('init-backend', initBackEnd.as_view(), name= 'gambiarra'),
    path('gmail/send-reminder', SendReminderEmailView.as_view(), name='send-reminder'),
    path('', include('users.urls')),
]
