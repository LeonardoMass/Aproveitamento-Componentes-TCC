from ..models import Student, Servant, Course
from rest_framework.response import Response
from rest_framework import status


class UserService:

    def createUser(self, usuario, serializer):

        print("User :", usuario)
        print("Email User :", usuario.email)
        
        is_student = serializer.validated_data["is_student"]
        course_instance = None

        if is_student:
            course_name = serializer.validated_data["course"]
            if course_name:
                try:
                    course_instance = Course.objects.get(name=course_name)
                except Course.DoesNotExist:
                    pass 
            try:
                student = Student.objects.get(user=usuario)
                student.name = serializer.validated_data["name"]
                student.matricula = serializer.validated_data["matricula"]
                student.course = course_instance
                student.save()
                return student
            except Student.DoesNotExist:
                return Student.objects.create(
                    name=serializer.validated_data["name"],
                    email=serializer.validated_data["email"],
                    matricula=serializer.validated_data["matricula"],
                    course=course_instance,
                    user=usuario
                )
        else:
            try:
                servant = Servant.objects.get(user=usuario)
                servant.name = serializer.validated_data["name"]
                servant.siape = serializer.validated_data["siape"]
                servant.servant_type = serializer.validated_data["servant_type"]
                servant.save()
                return servant
            except Servant.DoesNotExist:
                return Servant.objects.create(
                    name=serializer.validated_data["name"],
                    email=serializer.validated_data["email"],
                    siape=serializer.validated_data["siape"],
                    servant_type=serializer.validated_data["servant_type"],
                    user=usuario
                )

    def IsStudent(self, email):

        emailsStudent = ["@restinga.ifrs.edu.br", "@aluno.restinga.ifrs.edu.br"]
        return any(email.endswith(emails) for emails in emailsStudent)


    def userAutorized(self, user):

        user_autorized = False
        try:
            staff = Servant.objects.get(user=user)
            if ((staff.servant_type == "Coordenador") or (staff.servant_type == "Ensino")):
                user_autorized = True
        except Servant.DoesNotExist:
            pass
        return user_autorized

    def userAutorizedEnsino(self, user):

        user_autorized = False
        try:
            staff = Servant.objects.get(user=user)
            if staff.servant_type == "Ensino":
                user_autorized = True
        except Servant.DoesNotExist:
            pass
        return user_autorized