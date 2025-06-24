import uuid

from django.db import models

from users.models.servant import Servant


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    coordinator = models.OneToOneField(Servant, on_delete=models.SET_NULL, null=True, blank=True)
    professors = models.ManyToManyField(Servant, related_name="course_professors", blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-is_active', 'name']