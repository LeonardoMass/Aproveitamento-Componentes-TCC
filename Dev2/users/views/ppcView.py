from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from users.models import Ppc
from users.serializers import PpcSerializer
from users.services.user import UserService
from django.shortcuts import get_object_or_404
import uuid

class ListCreatePpcAPIView(generics.ListCreateAPIView):
    serializer_class = PpcSerializer
    permission_classes = [IsAuthenticated]
    # queryset = Ppc.objects.all()

    def get_queryset(self):
        """
        Sobrescreve o método padrão para filtrar PPCs por course_id,
        se o parâmetro 'course_id' for passado na URL query string.
        """
        queryset = Ppc.objects.select_related('course').prefetch_related('disciplines').all()

        course_id_param = self.request.query_params.get('course_id', None)

        if course_id_param:
            try:
                valid_uuid = uuid.UUID(str(course_id_param))
                queryset = queryset.filter(course_id=valid_uuid)
            except (ValueError, TypeError):
                print(f"WARNING: course_id inválido recebido: {course_id_param}")
                return Ppc.objects.none()
        return queryset

    # def perform_create(self, serializer):
    #     course_id = serializer.validated_data.get('course').id
    #     course = get_object_or_404(Course, id=course_id)
    #     usuario = self.request.user
    #     user_service = UserService()
    #     if not user_service.userAutorizedEnsino(usuario):
    #         from rest_framework.exceptions import PermissionDenied
    #         raise PermissionDenied("Usuário não autorizado para criar PPC para este curso.")
    #     serializer.save()

class RetrieveUpdateDestroyPpcAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ppc.objects.all()
    serializer_class = PpcSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    # def check_object_permissions(self, request, obj):
    #     super().check_object_permissions(request, obj)
    #     user_service = UserService()
    #     if request.method in ['PUT', 'PATCH', 'DELETE']:
    #         if not user_service.userAutorizedEnsino(request.user):
    #             self.permission_denied(...)