from django.contrib import admin

from users.models.course import Course
from users.models.notice import Notice
from .models import AbstractUser, Servant, Student, Disciplines, Ppc
from users.models.forms import RecognitionOfPriorLearning, KnowledgeCertification, Attachment, Step

# Register your models here.
admin.site.register((
   AbstractUser,
   Student,
   Servant,
   Disciplines,
   Notice,
   Course,
   Ppc,
   RecognitionOfPriorLearning,
   KnowledgeCertification,
   Attachment,
   Step
))