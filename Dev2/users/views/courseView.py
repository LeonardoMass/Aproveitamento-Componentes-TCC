from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from users.serializers import ServantSerializer
from users.models import Course
from users.serializers import CourseSerializer, ReducedCourseSerializer
from users.models.discipline import Disciplines
from users.models import Servant
from users.services.user import UserService

class ListCoursesAPIView(APIView):

    def get(self, request, *args, **kwargs):

        course_name = request.GET.get('course_name')
        reduced = request.GET.get('reduced')
        courses_filter = Q()

        # Filtro pelo nome do curso
        if course_name:
            courses_filter &= Q(name__icontains=course_name)

        # Buscando cursos de acordo com os filtros aplicados
        courses = Course.objects.filter(courses_filter)

        if reduced:
            courses_serialized = ReducedCourseSerializer(courses, many=True)
        else:
            courses_serialized = CourseSerializer(courses, many=True)

        return Response(courses_serialized.data)


class SearchCourseByNameAPIView(APIView):
    def get(self, request, *args, **kwargs):
        name = request.GET.get('name')

        # Verifica se o parâmetro de nome foi passado
        if not name:
            return Response({"error": "Name parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Busca cursos cujo nome contém o valor especificado, ignorando maiúsculas/minúsculas
        courses = Course.objects.filter(Q(name__icontains=name))

        # Serializa os cursos encontrados
        if courses.exists():
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Retorna uma resposta vazia caso não encontre cursos
        return Response({"message": "No courses found with the specified name."}, status=status.HTTP_404_NOT_FOUND)


class CreateCourseAPIView(APIView):

    permission_classes = [IsAuthenticated]
    user_service = UserService()

    def post(self, request, *args, **kwargs):
        serializer = CourseSerializer(data=request.data)
        usuario = request.user

        if not self.user_service.userAutorizedEnsino(usuario):
            return Response({"detail": "Usuário não autorizado"}, status=status.HTTP_403_FORBIDDEN)

        if serializer.is_valid():
            course_data = serializer.validated_data
            coordinator = None
            coordinator_id_data = course_data.get('coordinator_id', None)
            if coordinator_id_data is not None:
                 coordinator = coordinator_id_data
            course = Course.objects.create(
                name=course_data['name'],
                coordinator=coordinator,
            )

            # Relacionamentos ManyToMany
            if 'professors' in course_data:
                course.professors.set(course_data['professors'])

            professor_ids_data = request.data.get('professor_ids')
            if professor_ids_data and isinstance(professor_ids_data, list):
                 try:
                     professors_queryset = Servant.objects.filter(id__in=professor_ids_data)
                     course.professors.set(professors_queryset)
                 except Exception as e:
                     print(f"Erro ao definir professores: {e}")
                     pass

            # Serializa novamente para devolver a resposta
            response_serializer = CourseSerializer(course)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        print(serializer.errors)
        # Retorna erro de validação
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RetrieveCourseByIdAPIView(APIView):

    permission_classes = [IsAuthenticated]
    user_service = UserService()

    def get(self, request, course_id, *args, **kwargs):
        usuario = request.user

        if not self.user_service.userAutorized(usuario):
            return Response(
                {"detail": "Usuário não autorizado"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Busca o curso pelo id
            course = Course.objects.get(id=course_id)

            # Serializa o curso encontrado
            serializer = CourseSerializer(course)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Course.DoesNotExist:
            # Retorna uma mensagem de erro caso o curso não seja encontrado
            return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)


class UpdateCourseAPIView(APIView):

    permission_classes = [IsAuthenticated]
    user_service = UserService()

    def put(self, request, course_id, *args, **kwargs):
        usuario = request.user
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        original_auth = self.user_service.userAutorized(usuario)

        is_course_coordinator = False
        if not original_auth:
            try:
                requesting_servant = Servant.objects.get(user=usuario)
                if course.coordinator == requesting_servant:
                    is_course_coordinator = True
            except Servant.DoesNotExist:
                pass

        if not original_auth and not is_course_coordinator:
            return Response({"detail": "Usuário não autorizado."}, status=status.HTTP_403_FORBIDDEN)
        serializer = CourseSerializer(course, data=request.data, partial=True)

        if serializer.is_valid():
            validated_data = serializer.validated_data

            coordinator_data = validated_data.get('coordinator_id')
            if coordinator_data is not None:
                if Course.objects.filter(coordinator=coordinator_data).exclude(id=course.id).exists():
                     return Response(
                         {"detail":"Este coordenador já está associado a outro curso."},
                         status=status.HTTP_400_BAD_REQUEST,
                     )
                course.coordinator = coordinator_data

            course.name = validated_data.get('name', course.name)
            course.save(update_fields=['name', 'coordinator'])
            if 'professor_ids' in request.data:
                professors_id_list = request.data.get('professor_ids')
                if isinstance(professors_id_list, list):
                     professors_queryset = Servant.objects.filter(id__in=professors_id_list)
                     course.professors.set(professors_queryset)
                else:
                     return Response({"detail": "Formato inválido."}, status=status.HTTP_400_BAD_REQUEST)

            updated_course_serializer = CourseSerializer(course)
            return Response({'detail':"Curso alterado com sucesso", 'updated':updated_course_serializer.data}, status=status.HTTP_200_OK)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteCourseAPIView(APIView):

    permission_classes = [IsAuthenticated]
    user_service = UserService()

    def delete(self, request, course_id, *args, **kwargs):
        usuario = request.user

        if not self.user_service.userAutorizedEnsino(usuario):
            return Response(
                {"detail": "Usuário não autorizado"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Busca o curso pelo ID
            course = Course.objects.get(id=course_id)
            # Deleta o curso
            course.delete()
            return Response({"message": "Course deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Course.DoesNotExist:
            # Retorna erro caso o curso não seja encontrado
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)


class CourseProfessorsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, coordinator_id, *args, **kwargs):
        coordinator = get_object_or_404(Servant, id=coordinator_id)
        course = get_object_or_404(Course, coordinator=coordinator)

        if course.coordinator.id != coordinator.id:
            return Response({'detail': 'Você não tem permissão para acessar este curso.'}, status=403)

        professors = course.professors.all()
        serializer = ServantSerializer(professors, many=True)

        return Response(serializer.data)