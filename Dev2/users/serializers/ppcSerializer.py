from rest_framework import serializers
from users.models import Ppc, Course, Disciplines


class PpcSerializer(serializers.ModelSerializer):
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )
    discipline_ids = serializers.PrimaryKeyRelatedField(
        queryset=Disciplines.objects.all(),
        source="disciplines",
        many=True,
        write_only=True,
        required=False,
    )
    course = serializers.StringRelatedField(read_only=True)
    disciplines = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Ppc
        fields = ["id", "name", "course", "course_id", "disciplines", "discipline_ids"]
        read_only_fields = ["id"]
