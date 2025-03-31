from django.urls import path
from .views.user_list_view import ListUsersAPIView
from .views.user import CreateUserView, UpdateActiveByIdView, UpdateUserByIdView
from .views.user_details import UserDetails
from .views.disciplineView import discipline_detail , discipline_list_create
urlpatterns = [
    path('users/list/', ListUsersAPIView.as_view(), name='list_users'),
    path('users/create/', CreateUserView.as_view(), name='create_user'),
    path('users/update-activity/<int:id>/', UpdateActiveByIdView.as_view(), name='update_active_user'),
    path('users/update/<int:id>/', UpdateUserByIdView.as_view(), name='update_user'),
    path('users/details/', UserDetails.as_view(), name='user-details'),
    path('api/disciplines/', discipline_list_create, name='discipline_list_create'),
    path('api/disciplines/<uuid:pk>/', discipline_detail, name='discipline_detail'),
]