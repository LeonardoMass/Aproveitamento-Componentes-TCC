from django.contrib import admin

from notices.models import Notice
from .models import AbstractUser, Servant, Student, Disciplines
from forms.models import RecognitionOfPriorLearning, KnowledgeCertification, Attachment

# Register your models here.
admin.site.register((
   AbstractUser,
   Student,
   Servant,
   Disciplines,
   Notice,
   RecognitionOfPriorLearning,
   KnowledgeCertification,
   Attachment
))