from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..serializers.user import CreateUserSerializer, UserPolymorphicSerializer
from ..services.user import UserService
from ..models import AbstractUser, Course
from rest_framework.permissions import IsAuthenticated


class CreateUserView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    user_service = UserService()

    def post(self, request):
        usuario = request.user
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            criar_usuario = self.user_service.createUser(usuario, serializer)
            if criar_usuario is not None:
                return Response({"detail": "Usuário criado com sucesso.","id": usuario.id}, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UpdateActiveByIdView(APIView):

    permission_classes = [IsAuthenticated]
    user_service = UserService()

    def get(self, request, id):
        usuario = request.user
        user_autorized = self.user_service.userAutorized(usuario)
        user = AbstractUser.objects.get(id=id)
        if not user_autorized:
            return Response({"detail": "Não autorizado"}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = not user.is_active
        user.save()
        message = "Usuário ativado com sucesso" if user.is_active else "Usuário inativado com sucesso"
        return Response({"detail": message}, status=status.HTTP_200_OK)
   
class UpdateUserByIdView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    user_service = UserService()

    def put(self, request, id):

        user_autorized = self.user_service.userAutorized(request.user)
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            is_student = serializer.validated_data["is_student"]
            try:
                usuario = AbstractUser.objects.get(id=id)
            except AbstractUser.DoesNotExist:
                return Response(
                {"detail": "Usuário não encontrado"},
                status=status.HTTP_403_FORBIDDEN
            )

            if (user_autorized): usuario.is_verified = True
            if (usuario.user == request.user) or (user_autorized):
                usuario.name = serializer.validated_data["name"]
                if is_student:
                    usuario.matricula = serializer.validated_data["matricula"]
                    course_name = serializer.validated_data["course"]
                    if course_name:
                        usuario.course = Course.objects.get(name=course_name)
                else:
                    usuario.siape = serializer.validated_data["siape"]
                    usuario.servant_type = serializer.validated_data["servant_type"]
                usuario.save()
                return Response({
                    "detail": "Usuário atualizado com sucesso.",
                    "data": serializer.data
                },status=status.HTTP_200_OK)
            return Response({"detail": "Usuário não autorizado"},status=status.HTTP_403_FORBIDDEN)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
