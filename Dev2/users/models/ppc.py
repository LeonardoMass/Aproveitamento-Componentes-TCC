import uuid

from django.db import models
from users.models.discipline import Disciplines

class Ppc(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    disciplines = models.ManyToManyField(Disciplines, related_name='ppc_disciplines', blank=True)
    course = models.ForeignKey('users.Course', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-is_active', 'name']