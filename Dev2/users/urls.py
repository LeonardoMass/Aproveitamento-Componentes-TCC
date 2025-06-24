from django.urls import path
from .views.user_list_view import ListUsersAPIView, RetrieveUserByIdView
from .views.user import CreateUserView, UpdateActiveByIdView, UpdateUserByIdView
from .views.user_details import UserDetails
from .views.disciplineView import discipline_detail , discipline_list_create, discipline_list_by_ids
from .views.noticeView import NoticeListCreateView, NoticeDetailView
from .views.courseView import (ListCoursesAPIView, CreateCourseAPIView,
                                RetrieveCourseByIdAPIView, UpdateCourseAPIView,
                                ChangeStateCourseAPIView, SearchCourseByNameAPIView, CourseProfessorsView)
from .views.formsView import (
    RecognitionOfPriorLearningListCreateView, RecognitionOfPriorLearningDetailView,
    KnowledgeCertificationListCreateView, KnowledgeCertificationDetailView, AttachmentDownloadView, StepCreateView, RecognitionAndCertificationListView, check_notice_open
)
from .views.ppcView import ListCreatePpcAPIView, RetrieveUpdateDestroyPpcAPIView
urlpatterns = [
    path('users/list/', ListUsersAPIView.as_view(), name='list_users'),
    path('users/create/', CreateUserView.as_view(), name='create_user'),
    path('users/update-activity/<int:id>/', UpdateActiveByIdView.as_view(), name='update_active_user'),
    path('users/update/<int:id>/', UpdateUserByIdView.as_view(), name='update_user'),
    path('users/details/', UserDetails.as_view(), name='user-details'),
    path('users/retrieve/<int:id>/', RetrieveUserByIdView.as_view(), name='retrieve_user_by_id'),
    path('api/disciplines/', discipline_list_create, name='discipline_list_create'),
    path('api/disciplines/<uuid:pk>/', discipline_detail, name='discipline_detail'),
    path('api/disciplines/get-by-ids/', discipline_list_by_ids, name='discipline_list_by_ids'),
    path('notices/', NoticeListCreateView.as_view(), name='notice-list-create'),
    path('notices/<uuid:id>/', NoticeDetailView.as_view(), name='notice-detail'),
    path('courses/list/', ListCoursesAPIView.as_view(), name='list_courses'),
    path('courses/create/', CreateCourseAPIView.as_view(), name='create_course'),
    path('courses/read/<uuid:course_id>/', RetrieveCourseByIdAPIView.as_view(), name='read_course_by_id'),
    path('courses/update/<uuid:course_id>', UpdateCourseAPIView.as_view(), name='update_course'),
    path('courses/state/<uuid:course_id>', ChangeStateCourseAPIView.as_view(), name='change_state_course'),
    path('courses/search/', SearchCourseByNameAPIView.as_view(), name='search_course_by_name'),
    path('courses/professors/<int:coordinator_id>', CourseProfessorsView.as_view(), name='professors'),
    path('forms/steps/', StepCreateView.as_view(), name='step-create'),
    path('forms/recognition-forms/', RecognitionOfPriorLearningListCreateView.as_view(), name='recognition-forms-list-create'),
    path('forms/recognition-forms/<uuid:id>/', RecognitionOfPriorLearningDetailView.as_view(), name='recognition-form-detail'),
    path('forms/knowledge-certifications/', KnowledgeCertificationListCreateView.as_view(), name='knowledge-certifications-list-create'),
    path('forms/list/', RecognitionAndCertificationListView.as_view(), name='unified-forms-list'),
    path('forms/knowledge-certifications/<uuid:id>/', KnowledgeCertificationDetailView.as_view(), name='knowledge-certification-detail'),
    path('forms/attachments/<str:attachment_id>/', AttachmentDownloadView.as_view(), name='download_attachment'),
    path('forms/check-notice-open/', check_notice_open, name='check-notice-open'),  # URL específica de verificação
    path('ppc/', ListCreatePpcAPIView.as_view(), name='ppc-list-create'),
    path('ppc/<uuid:id>/', RetrieveUpdateDestroyPpcAPIView.as_view(), name='ppc-detail'),
]