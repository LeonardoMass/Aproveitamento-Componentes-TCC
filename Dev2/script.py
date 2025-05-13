from django.contrib.auth.models import User

from users.models import Course
from users.models.notice import Notice
from users.models import Student, Servant
from users.models.discipline import Disciplines
from users.enum.servant_type_enum import ServantTypeEnum
from users.models.ppc import Ppc
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
    number="001-2025",
    publication_date="2025-05-01T09:00:00Z",
    documentation_submission_start="2025-04-01T00:00:00Z",
    documentation_submission_end="2025-10-01T17:00:00Z",
    proposal_analysis_start="2025-10-12T09:00:00Z",
    proposal_analysis_end="2025-10-20T17:00:00Z",
    result_publication="2025-10-21T09:00:00Z",
    result_homologation="2025-10-23T09:00:00Z",
    link="https://dev2.com"
)

notice2 = Notice.objects.create(
    id="1f7755ade0b341299ee00c46a12dc468",
    number="002-2024",
    publication_date="2024-10-01T09:00:00Z",
    documentation_submission_start="2024-10-05T00:00:00Z",
    documentation_submission_end="2024-10-06T17:00:00Z",
    proposal_analysis_start="2024-10-12T09:00:00Z",
    proposal_analysis_end="2024-10-20T17:00:00Z",
    result_publication="2024-10-21T09:00:00Z",
    result_homologation="2024-10-23T09:00:00Z",
    link="https://ifrs.edu.br/alvorada/editais/edital-n-26-2024-aproveitamento-de-estudos-e-certificacao-de-conhecimentos-para-estudantes-regularmente-matriculados-nos-cursos-superiores-e-tecnicos-subsequentes-do-ifrs-campus-alvorada/"
)

notice3 = Notice.objects.create(
    id="1f7755ade0b341299ee00c46a12dc469",
    number="001-2024",
    publication_date="2024-01-01T09:00:00Z",
    documentation_submission_start="2024-01-02T00:00:00Z",
    documentation_submission_end="2024-01-03T17:00:00Z",
    proposal_analysis_start="2024-01-03T09:00:00Z",
    proposal_analysis_end="2024-01-04T17:00:00Z",
    result_publication="2024-01-04T09:00:00Z",
    result_homologation="2024-01-05T09:00:00Z",
    link="https://ifrs.edu.br/canoas/editais/edital-no-2-2024-gab-can-aproveitamento-de-estudos-para-os-alunos-regularmente-matriculados-nos-cursos-superiores-do-ifrs-campus-canoas/"
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
    name= "Programacão I",
    workload= "66h",
    syllabus= "Conceitos fundamentais da progracao",
    professors= "Incentivar o pensamento abstrato para programar e utilizar conceitos fundamentais",
)

discipline4 = Disciplines.objects.create(
    name= "Gestao de Projetos",
    workload= "66h",
    syllabus= "Conceitos fundamentais da gestão de projetos",
    professors= "Incentivar a adaptacão de conceitos fundamentais para a gestão de projetos",
)

discipline5 = Disciplines.objects.create(
    name= "Introducão à Engenharia de Software",
    workload= "33h",
    syllabus= "Introduzir os principais conceitos de engenharia de software relacionando estes conceitos ao ciclo de vida do desenvolvimento de software",
    professors= "Histórico e conceituacão da Engenharia de Software. Princípios da Engenharia de Software."+
"Conceito e apresentacão dos principais ciclos de vida: Cascata, Prototipacão, Espiral, Iterativo e"+
"Incremental. Conceituacão sobre Processos de Software. Processo de Software Tradicional x Métodos"+
"Ágeis. Manifesto Ágil. Introducão aos métodos ágeis: Metodologia Extreme Programming e SCRUM."+
"Conceitos de Gerência de configuracão. Introducão a ferramenta de gerência de configuracão (Github)",
)

discipline6 = Disciplines.objects.create(
    name= "Programacão II",
    workload= "66h",
    syllabus= "Familiarizar o(a) estudante com conceitos do paradigma de programacão orientada a objetos. ",
    professors= "Classes e Objetos conceitos avancados. Encapsulamento de Dados. Heranca."+
"Interfaces e Polimorfismo. Sobrecarga e Sobrescrita de Métodos. Tratamento de Excecões."+
"Linguagem de Programacão Orientada a Objeto.",
)

discipline7 = Disciplines.objects.create(
    name= "Interfaces Web",
    workload= "33h",
    syllabus= "Apresentar tecnologias e ferramentas para desenvolvimento de páginas web (lado cliente) de acordo com os padrões consolidados no mercado",
    professors= "Linguagem de marcacão HTML (HyperText Markup Language): principais tags, construcão de layouts, elementos multimídia, listas, tabelas, formulários e validacão de formulários. Estilizacão com"+
"CSS (Cascading Style Sheets): regras, seletores, classes, pseudo classes, pseudo elementos, heranca,"+
"propriedades, dimensionamento, posicionamento. I",
)
course1 = Course.objects.create(name="Processos Gerenciais")
course1.professors.add(yuri)
ppc_course1 = Ppc.objects.create(course=course1, name="PPC Processos 2021 PG")
ppc_course1.disciplines.add(discipline4)

course2 = Course.objects.create(name="Eletronica Industrial")

course3 = Course.objects.create(
    name="Analise e Desenvolvimento de Sistemas",
    coordinator = roben
)
course3.professors.add(eliana, ricardo, yuri)
ppc_course3 = Ppc.objects.create(course=course3, name="PPC 2023 ADS")
ppc_course3.disciplines.add(discipline1, discipline2, discipline3)
print("Cursos criados com sucesso!")
