# Generated by Django 5.0.3 on 2024-10-29 23:23

import django.db.models.deletion
import django.utils.timezone
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('disciplines', '0001_initial'),
        ('notices', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('type', models.CharField(max_length=50)),
                ('size', models.CharField(max_length=50)),
                ('file', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='RecognitionOfPriorLearning',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('create_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('status', models.CharField(choices=[('CR', 'Solicitação Criada'), ('CRE', 'Em análise do Ensino'), ('PROF', 'Em análise do Professor'), ('COORD', 'Em análise do Coordenador'), ('RJ_CRE', 'Rejeitado pelo Ensino'), ('RJ_COORD', 'Rejeitado pelo Coordenador'), ('APPROVING', 'Em retorno'), ('SCHEDULED_TEST', 'Prova Agendada'), ('GRANTED', 'Deferido'), ('REJECTED', 'Indeferido'), ('COMPLETED', 'Concluído')], default='CR', max_length=20)),
                ('servant_feedback', models.TextField(blank=True, null=True)),
                ('servant_analysis_date', models.DateTimeField(blank=True, null=True)),
                ('professor_feedback', models.TextField(blank=True, null=True)),
                ('professor_analysis_date', models.DateTimeField(blank=True, null=True)),
                ('coordinator_feedback', models.TextField(blank=True, null=True)),
                ('coordinator_analysis_date', models.DateTimeField(blank=True, null=True)),
                ('course_workload', models.IntegerField()),
                ('test_score', models.DecimalField(decimal_places=2, max_digits=5)),
                ('course_studied_workload', models.IntegerField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Step',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notice_id', models.UUIDField()),
                ('student_id', models.UUIDField()),
                ('responsible_id', models.UUIDField()),
                ('description', models.TextField()),
                ('initial_step_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('final_step_date', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='KnowledgeCertification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('create_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('status', models.CharField(choices=[('CR', 'Solicitação Criada'), ('CRE', 'Em análise do Ensino'), ('PROF', 'Em análise do Professor'), ('COORD', 'Em análise do Coordenador'), ('RJ_CRE', 'Rejeitado pelo Ensino'), ('RJ_COORD', 'Rejeitado pelo Coordenador'), ('APPROVING', 'Em retorno'), ('SCHEDULED_TEST', 'Prova Agendada'), ('GRANTED', 'Deferido'), ('REJECTED', 'Indeferido'), ('COMPLETED', 'Concluído')], default='CR', max_length=20)),
                ('servant_feedback', models.TextField(blank=True, null=True)),
                ('servant_analysis_date', models.DateTimeField(blank=True, null=True)),
                ('professor_feedback', models.TextField(blank=True, null=True)),
                ('professor_analysis_date', models.DateTimeField(blank=True, null=True)),
                ('coordinator_feedback', models.TextField(blank=True, null=True)),
                ('coordinator_analysis_date', models.DateTimeField(blank=True, null=True)),
                ('previous_knowledge', models.TextField()),
                ('scheduling_date', models.DateTimeField()),
                ('test_score', models.DecimalField(decimal_places=2, max_digits=5)),
                ('attachments', models.ManyToManyField(blank=True, related_name='certification_requests', to='forms.attachment')),
                ('discipline', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='certification_requisitions', to='disciplines.disciplines')),
                ('notice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='certification_notices', to='notices.notice')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
