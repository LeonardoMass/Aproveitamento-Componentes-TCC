from uuid import UUID
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from users.models.forms import KnowledgeCertification, RecognitionOfPriorLearning
from ..models.discipline import Disciplines
from ..serializers.disciplineSerializer import DisciplineSerializer
from rest_framework.permissions import IsAuthenticated
from users.services.user import UserService


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def discipline_list_create(request):
    user_service = UserService()

    if request.method == 'GET':
        disciplines = Disciplines.objects.all()
        serializer = DisciplineSerializer(disciplines, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        usuario = request.user
        if not user_service.userAutorized(usuario):
            return Response({"detail": "Usuário não autorizado para criar disciplinas."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = DisciplineSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Disciplina foi criada com sucesso."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def discipline_detail(request, pk):
    user_service = UserService()

    try:
        discipline = Disciplines.objects.get(pk=pk)
    except Disciplines.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'GET':
        active_param = request.query_params.get('active')
        if active_param is not None:
            active_param = active_param.lower()
            if active_param == 'true':
                if not discipline.is_active:
                    return Response(status=status.HTTP_404_NOT_FOUND)
            elif active_param == 'false':
                if discipline.is_active:
                    return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = DisciplineSerializer(discipline)
        return Response(serializer.data)

    # validação
    usuario = request.user
    if not user_service.userAutorized(usuario):
        return Response({"detail": "Usuário não autorizado."},
                        status=status.HTTP_403_FORBIDDEN)

    elif request.method == 'PUT':
        print("Método PUT chamado")  # Log de teste
        serializer = DisciplineSerializer(discipline, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Disciplina foi atualizada com sucesso."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        has_recognition_forms = RecognitionOfPriorLearning.objects.filter(discipline=discipline).exists()
        has_certification_forms = KnowledgeCertification.objects.filter(discipline=discipline).exists()

        if has_recognition_forms or has_certification_forms:
            # Se houver associações, apenas inativa a disciplina
            if discipline.is_active:
                discipline.is_active = False
                discipline.save()
                return Response({"detail": "Disciplina foi inativada pois está associada a solicitações."},
                                status=status.HTTP_200_OK)
            else:
                discipline.is_active = True
                discipline.save()
                return Response({"detail": "Disciplina foi ativa."}, status=status.HTTP_200_OK)
        else:
            discipline.delete()
            # Retorna 204 No Content para indicar sucesso na exclusão
            return Response({"detail": "Disciplina foi excluida."}, status=status.HTTP_200_OK)
    return Response({"detail": "Um erro ocorreu em disciplinas."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def discipline_list_by_ids(request):
    try:
        discipline_ids = request.data.get('ids', [])
        active_param = request.data.get('active', None)

        if not discipline_ids:
            return Response({"detail": "Nenhum ID fornecido."}, status=status.HTTP_400_BAD_REQUEST)

        valid_ids = []
        for id in discipline_ids:
            try:
                valid_ids.append(UUID(id))
            except ValueError:
                pass
        disciplines = Disciplines.objects.filter(id__in=valid_ids)

        if active_param is not None:
            disciplines = disciplines.filter(is_active=active_param)

        serializer = DisciplineSerializer(disciplines, many=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)