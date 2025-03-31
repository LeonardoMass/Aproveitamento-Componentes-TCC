from django.urls import path
from .views.user_list_view import ListUsersAPIView
from .views.user import CreateUserView, UpdateActiveByIdView, UpdateUserByIdView
from .views.user_details import UserDetails
from .views.disciplineView import discipline_detail , discipline_list_create
from .views.noticeView import NoticeListCreateView, NoticeDetailView
from .views.courseView import (ListCoursesAPIView, CreateCourseAPIView,
                                RetrieveCourseByIdAPIView, UpdateCourseAPIView,
                                DeleteCourseAPIView, SearchCourseByNameAPIView, CourseProfessorsView)
urlpatterns = [
    path('users/list/', ListUsersAPIView.as_view(), name='list_users'),
    path('users/create/', CreateUserView.as_view(), name='create_user'),
    path('users/update-activity/<int:id>/', UpdateActiveByIdView.as_view(), name='update_active_user'),
    path('users/update/<int:id>/', UpdateUserByIdView.as_view(), name='update_user'),
    path('users/details/', UserDetails.as_view(), name='user-details'),
    path('api/disciplines/', discipline_list_create, name='discipline_list_create'),
    path('api/disciplines/<uuid:pk>/', discipline_detail, name='discipline_detail'),
    path('notices/', NoticeListCreateView.as_view(), name='notice-list-create'),
    path('notices/<uuid:id>/', NoticeDetailView.as_view(), name='notice-detail'),
    path('courses/list', ListCoursesAPIView.as_view(), name='list_courses'),
    path('courses/create', CreateCourseAPIView.as_view(), name='create_course'),
    path('courses/read/<uuid:course_id>/', RetrieveCourseByIdAPIView.as_view(), name='read_course_by_id'),
    path('courses/update/<uuid:course_id>', UpdateCourseAPIView.as_view(), name='update_course'),
    path('courses/delete/<uuid:course_id>', DeleteCourseAPIView.as_view(), name='delete_course'),
    path('courses/search/', SearchCourseByNameAPIView.as_view(), name='search_course_by_name'),
    path('courses/professors/<int:coordinator_id>', CourseProfessorsView.as_view(), name='professors')
]