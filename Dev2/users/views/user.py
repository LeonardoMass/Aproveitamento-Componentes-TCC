from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..serializers.user import CreateUserSerializer, UserSerializer
from ..services.user import UserService
from ..models import AbstractUser


class CreateUserView(APIView):

    parser_classes = (MultiPartParser, FormParser)
    user_service = UserService()

    def post(self, request):
        usuario = request.user
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            criarUsuario = self.user_service.createUser(usuario, serializer)
            if criarUsuario is not None:
                return Response({"id": usuario.id}, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AlterActiveByEmailView(APIView):

   def get(self, request, email):
        usuario = request.user
        #if usuario type is coordenador ou ensino
        userByEmail = AbstractUser.objects.get(email=email)
        if userByEmail is None:
            return Response({'not ok'}, status=status.HTTP_400_BAD_REQUEST)
        userByEmail.is_active = not userByEmail.is_active
        userByEmail.save()
        return Response({'ok'},status=status.HTTP_201_CREATED)


class RetrieveUserByIdAPIView(APIView):
    def get(self, request, user_id, *args, **kwargs):
        try:
            # Busca o user pelo id
            user = AbstractUser.objects.get(id=user_id)

            # Serializa a user encontrada
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except AbstractUser.DoesNotExist:
            # Retorna uma mensagem de erro caso a user não seja encontrada
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)