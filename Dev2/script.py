from django.contrib.auth.models import User

from users.models import Course
from users.models.notice import Notice
from users.models import Student, Servant
from users.models.discipline import Disciplines
from users.enum.servant_type_enum import ServantTypeEnum
superuser = User.objects.create_superuser("admin", "admin@admin.com", "123")

student1 = User.objects.create_user(username='murilo@hotmail.com', first_name='murilo', email='murilo@hotmail.com',
                                    password=None)
Student.objects.create(
    user=student1,
    name='murilo',
    email='murilo@hotmail.com',
    matricula="1994000401",
    course="ADS"
)
stundent2 = User.objects.create_user(username='eduador@hotmail.com', first_name='eduador', email='eduador@hotmail.com',
                                     password=None)
Student.objects.create(
    user=stundent2,
    name='eduardo',
    email='eduardo@hotmail.com',
    matricula="3212313",
    course="ADS",
    is_active=False
)
stundent3 = User.objects.create_user(username='aaa', first_name='bruno', email='bruno@hotmail.com', password=None)
Student.objects.create(
    user= stundent3,
    name='bruno',
    email='bruno@gmail.com',
    matricula="323123",
    course="ADS",
)

stundent4 = User.objects.create_user(username='bbb', first_name='fernando', email='fernando@hotmail.com', password=None)
Student.objects.create(
    user= stundent4,
    name='fernando',
    email='fernando@gmail.com',
    matricula="323123",
    course="ADS",
)

teacher = User.objects.create_user(username='ricardo@hotmail.com', first_name='ricardo', email='ricardo@hotmail.com',
                                   password=None)
ricardo = Servant.objects.create(
    user=teacher,
    name='ricardo',
    email='ricardo@hotmail.com',
    siape="123123",
    servant_type=ServantTypeEnum.TEACHER.value,
)
teacher2 = User.objects.create_user(username='eliana@hotmail.com', first_name='eliana', email='eliana@hotmail.com',
                                   password=None)
eliana = Servant.objects.create(
    user=teacher2,
    name='eliana',
    email='elinana@hotmail.com',
    siape="32323",
    servant_type=ServantTypeEnum.TEACHER.value,
)

teacher3 = User.objects.create_user(username='yuri@hotmail.com', first_name='Yuri', email='yuri@hotmail.com',
                                   password=None)
yuri = Servant.objects.create(
    user=teacher3,
    name='Yuri ',
    email='yuri@hotmail.com',
    siape="32323223",
    servant_type=ServantTypeEnum.TEACHER.value,
)
coordenador = User.objects.create_user(username='roben@hotmail.com', first_name='roben', email='roben@hotmail.com',
                                       password=None)
roben = Servant.objects.create(
    user=coordenador,
    name='roben',
    email='roben@hotmail.com',
    siape="3213234455",
    servant_type=ServantTypeEnum.COORDINATOR.value,
    is_verified=True
)

cre = User.objects.create_user(username='servidor@hotmail.com', first_name='servidor', email='servidor@hotmail.com',
                               password=None)
Servant.objects.create(
    user= cre,
    name='ensino',
    email='servidor@hotmail.com',
    siape="2121212",
    servant_type=ServantTypeEnum.ENSINO.value,
    is_verified=True
)
cre2 = User.objects.create_user(username='114283125304604622211', first_name='servidor', email='crerestinga@gmail.com', password=None)
Servant.objects.create(
    user= cre2,
    name='ADMINISTRADOR',
    email='crerestinga@gmail.com',
    siape="0000000",
    servant_type=ServantTypeEnum.ENSINO.value,
    is_verified=True
)
notice = Notice.objects.create(
    id="1f7755ade0b341299ee00c46a12dc467",
    number="001-2023",
    publication_date="2023-10-01T09:00:00Z",
    documentation_submission_start="2023-10-05T09:00:00Z",
    documentation_submission_end="2023-10-10T17:00:00Z",
    proposal_analysis_start="2023-10-11T09:00:00Z",
    proposal_analysis_end="2023-10-20T17:00:00Z",
    result_publication="2023-10-21T09:00:00Z",
    result_homologation="2023-10-23T09:00:00Z",
    link="https://dev2.com"
)

discipline1 = Disciplines.objects.create(
    id="fc40c88d-65ae-41ca-bd19-89075f9b4ea3",
    name="Redes de Computadores",
    workload=123,
    syllabus= "Servidor-cliente",
    professors= "Habilitar o aluno a compreender request-response"
)

discipline2 = Disciplines.objects.create(
    name= "Banco de Dados",
    workload= "66h",
    syllabus= "Consultas de dados",
    professors= "Habilitar o estudante a realizar consultas em bancado de dados",
)

discipline3 = Disciplines.objects.create(
    name= "Programacao",
    workload= "66h",
    syllabus= "Conceitos fundamentais da progracao",
    professors= "Incentivar o pensamento abstrato para programar e utilizar conceitos fundamentais",
)

discipline4 = Disciplines.objects.create(
    name= "Gestao de Projetos",
    workload= "66h",
    syllabus= "Conceitos fundamentais da gestão de projetos",
    professors= "Incentivar a adaptação de conceitos fundamentais para a gestão de projetos",
)


course1 = Course.objects.create(name="Processos Gerenciais")
course1.professors.add(yuri)
course1.disciplines.add(discipline4)

course2 = Course.objects.create(name="Eletronica Industrial")

course3 = Course.objects.create(
    name="Analise e Desenvolvimento de Sistemas",
    coordinator = roben
)
course3.professors.add(eliana, ricardo, yuri)
course3.disciplines.add(discipline1, discipline2, discipline3)

print("Cursos criados com sucesso!")
