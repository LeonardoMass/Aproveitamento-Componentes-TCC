from rest_framework import serializers
from ..models.discipline import Disciplines

class DisciplineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disciplines
        fields = ['id', 'name', 'workload', 'syllabus', 'prerequisites', 'main_objetive', 'is_active']