import uuid

from django.db import models
from django.utils import timezone

from notices.models import Notice


# Enum para status da requisição
class RequestStatus(models.TextChoices):
    CREATED_REQUEST = "CR", "Solicitação Criada"
    IN_ANALYSIS_BY_CRE = "CRE", "Em análise do Ensino"
    IN_ANALYSIS_BY_PROFESSOR = "PROF", "Em análise do Professor"
    IN_ANALYSIS_BY_COORDINATOR = "COORD", "Em análise do Coordenador"
    REJECTED_BY_CRE = "RJ_CRE", "Rejeitado pelo Ensino"
    REJECTED_BY_COORDINATOR = "RJ_COORD", "Rejeitado pelo Coordenador"
    APPROVING = "APPROVING", "Em retorno"
    SCHEDULED_TEST = "SCHEDULED_TEST", "Prova Agendada"
    GRANTED = "GRANTED", "Deferido"
    REJECTED = "REJECTED", "Indeferido"
    COMPLETED = "COMPLETED", "Concluído"


# Model abstrato RequisitionForm
class RequisitionForm(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey('users.Student', on_delete=models.CASCADE, related_name="requisition_forms")
    discipline = models.ForeignKey('disciplines.Disciplines', on_delete=models.CASCADE,
                                   related_name="requisition_forms")
    create_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.CREATED_REQUEST)
    servant_feedback = models.TextField(blank=True, null=True)
    servant_analysis_date = models.DateTimeField(null=True, blank=True)
    professor_feedback = models.TextField(blank=True, null=True)
    professor_analysis_date = models.DateTimeField(null=True, blank=True)
    coordinator_feedback = models.TextField(blank=True, null=True)
    coordinator_analysis_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"RequisitionForm {self.id} - {self.status}"


# Model de Attachment
class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    size = models.CharField(max_length=50)
    file = models.TextField()  # Assumindo que este seja o conteúdo codificado do arquivo

    def __str__(self):
        return f"Attachment {self.name} ({self.type})"


# Model de RecognitionOfPriorLearning, derivado de RequisitionForm
class RecognitionOfPriorLearning(RequisitionForm):
    discipline = models.ForeignKey(
        'disciplines.Disciplines', on_delete=models.CASCADE, related_name="recognition_requisitions",
    )
    student = models.ForeignKey(
        'users.Student', on_delete=models.CASCADE, related_name="recognition_student"
    )
    notice = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name="recognition_notices")
    course_workload = models.IntegerField()
    test_score = models.DecimalField(max_digits=5, decimal_places=2)
    course_studied_workload = models.IntegerField()
    attachments = models.ManyToManyField(Attachment, related_name="recognition_requests", blank=True)

    def __str__(self):
        return f"RecognitionOfPriorLearning {self.id}"


# Model de KnowledgeCertification, derivado de RequisitionForm
class KnowledgeCertification(RequisitionForm):
    discipline = models.ForeignKey(
        'disciplines.Disciplines', on_delete=models.CASCADE, related_name="certification_requisitions"
    )
    student = models.ForeignKey(
        'users.Student', on_delete=models.CASCADE, related_name="certification_student"
    )
    notice = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name="certification_notices")
    previous_knowledge = models.TextField()
    scheduling_date = models.DateTimeField()
    test_score = models.DecimalField(max_digits=5, decimal_places=2)
    attachments = models.ManyToManyField(Attachment, related_name="certification_requests", blank=True)

    def __str__(self):
        return f"KnowledgeCertification {self.id}"


# Model de Step
class Step(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notice_id = models.UUIDField()
    student_id = models.UUIDField()
    responsible_id = models.UUIDField()
    description = models.TextField()
    initial_step_date = models.DateTimeField(default=timezone.now)
    final_step_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Step {self.id} - {self.description}"
