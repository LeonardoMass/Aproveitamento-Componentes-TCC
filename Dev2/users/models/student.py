from .user import AbstractUser
from .course import Course
from django.db import models


class Student(AbstractUser):
    matricula = models.CharField(max_length=255, blank=True)
    course = models.ForeignKey(
        Course, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name="students"
    )
    drive_folder_id = models.CharField(max_length=255, blank=True, null=True)

    @property
    def course_name(self):

        if self.course:
            return self.course.name
        return None
    class Meta:
        abstract = False

    def __str__(self):
        return self.name + " - Estudante"
