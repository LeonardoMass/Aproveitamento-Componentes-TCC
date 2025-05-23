from rest_framework import generics, status
from rest_framework.response import Response

from ..models.notice import Notice
from ..serializers.noticeSerializer import NoticeSerializer
from rest_framework.permissions import IsAuthenticated
from users.services.user import UserService

class NoticeListCreateView(generics.ListCreateAPIView):

    permission_classes = [IsAuthenticated]
    user_service = UserService()

    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    
    def post(self, request, *args, **kwargs):
        # Verifique o tipo de usuário
        user = request.user
        user_autorized = self.user_service.userAutorized(user)
        if not user_autorized:
            return Response(
                {"detail": "Você não tem permissão para criar este recurso."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().post(request, *args, **kwargs)

class NoticeDetailView(generics.RetrieveUpdateDestroyAPIView):

    permission_classes = [IsAuthenticated]
    user_service = UserService()

    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        # Verifique o tipo de usuário
        user = request.user
        user_autorized = self.user_service.userAutorized(user)
        if not user_autorized:
            return Response(
                {"detail": "Você não tem permissão para atualizar este recurso."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        print("Método DELETE foi chamado, mas não permitido.")
        return Response({"detail": "Método DELETE não permitido."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
