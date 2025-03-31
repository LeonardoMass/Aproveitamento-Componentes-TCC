from django.contrib import admin

from users.models.course import Course
from users.models.notice import Notice
from .models import AbstractUser, Servant, Student, Disciplines
from forms.models import RecognitionOfPriorLearning, KnowledgeCertification, Attachment

# Register your models here.
admin.site.register((
   AbstractUser,
   Student,
   Servant,
   Disciplines,
   Notice,
   Course,
   RecognitionOfPriorLearning,
   KnowledgeCertification,
   Attachment
))