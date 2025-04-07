from rest_framework.views import APIView
from rest_framework.response import Response
from ..models.student import Student
from ..models.servant import Servant
from rest_framework import status
from users.models.user import AbstractUser
from ..serializers.user import UserPolymorphicSerializer
from rest_framework.permissions import IsAuthenticated


class ListUsersAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        """
        Retorna uma lista de todos os usuários.
        """
        # Get filter parameters
        user_type_param = request.GET.get("user_type")
        name = request.GET.get("name")
        is_active = request.GET.get("is_active")

        if user_type_param == "Student":
            queryset = Student.objects.all()
        elif user_type_param == "Servant":
            queryset = Servant.objects.all()
        elif user_type_param:
            queryset = Servant.objects.filter(servant_type=user_type_param)
        else:
            # Get all users
            queryset = AbstractUser.objects.all()

        if name:
            # Case-insensitive partial match on name
            queryset = queryset.filter(name__icontains=name)

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)

        serializer = UserPolymorphicSerializer(queryset, many=True)
        return Response(serializer.data)

class RetrieveUserByIdView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id, format=None):
        """
        Retorna os detalhes do usuário com o ID fornecido.
        """
        try:
            usuario = AbstractUser.objects.get(id=id)
            print(f"Usuário encontrado: {usuario}")
            serializer = UserPolymorphicSerializer(usuario)
            print(f"Dados do usuário serializados: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except AbstractUser.DoesNotExist:
            return Response(
                {"detail": "Usuário não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Erro inesperado ao buscar usuário por ID {id}: {e}")
            return Response(
                {"detail": "Erro interno ao processar a solicitação."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )