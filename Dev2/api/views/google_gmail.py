from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from collections import defaultdict
from ..services import GmailService
from django.conf import settings
import textwrap
from users.models.notice import Notice
from users.models.forms import RecognitionOfPriorLearning, Step, RequestStatus
from rest_framework.permissions import IsAuthenticated
class SendReminderEmailView(APIView):

    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            gmail_service = GmailService()
            solicitacao = request.data
            notice_id = solicitacao.get('notice')
            if not notice_id:
                return Response({"detail": "ID do edital não fornecido na requisição."}, status=status.HTTP_404_NOT_FOUND)

            try:
                notice = Notice.objects.get(id=notice_id)
                end_date_formatted = notice.proposal_analysis_end.strftime('%d/%m/%Y')
            except Notice.DoesNotExist:
                return Response({"detail": "Edital não encontrado."}, status=status.HTTP_404_NOT_FOUND)

            steps_list = solicitacao.get('steps', [])
            if not steps_list:
                return Response({"error": "Nenhum passo encontrado na solicitação."}, status=status.HTTP_404_NOT_FOUND)

            current_step = None
            for step in steps_list:
                if step.get('current') is True:
                    current_step = step
                    break 

            if not current_step:
                return Response({"error": "Passo atual (current=True) não encontrado."}, status=status.HTTP_404_NOT_FOUND)

            responsible_data = current_step.get('responsible')
            if not responsible_data:
                 return Response({"error": "Dados do responsável não encontrados no passo atual."}, status=status.HTTP_404_NOT_FOUND)

            recipient_email = responsible_data.get('email')
            recipient_name = responsible_data.get('name', 'Prezado(a)')

            if not recipient_email:
                return Response({"error": "E-mail do responsável não encontrado."}, status=status.HTTP_404_NOT_FOUND)

            student_name = solicitacao.get('student_name')
            discipline_name = solicitacao.get('discipline_name')
            status_display = solicitacao.get('status_display')
            course = solicitacao.get('student_course')
            type = solicitacao.get('type')
            requestType = "Aproveitamento de estudos" if type == "recognition" else "Certificação de conhecimento"

            subject = f"Lembrete: Pendência na Solicitação de {student_name}"

            html_body = f"""
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }}
                        .header {{ font-size: 1.2em; font-weight: bold; color: #444; }}
                        .details {{ margin-top: 15px; padding-left: 15px; border-left: 3px solid #28a745; }}
                        .deadline {{ color: #dc3545; font-weight: bold; }}
                        .footer {{ margin-top: 25px; font-size: 0.9em; color: #777; }}
                        a {{ color: #007bff; text-decoration: none; }}
                        a:hover {{ text-decoration: underline; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p class="header">Olá, {recipient_name},</p>
                        <p>Este é um lembrete automático de que uma solicitação está aguardando sua análise no Sistema de Aproveitamento de Estudos.</p>

                        <div class="details">
                            <p><strong>Tipo de Solicitação:</strong> {requestType}</p>
                            <p><strong>Estudante:</strong> {student_name}</p>
                            <p><strong>Disciplina:</strong> {discipline_name}</p>
                            <p><strong>Curso:</strong> {course}</p>
                            <p><strong>Status Atual:</strong> {status_display}</p>
                        </div>

                        <p>Por favor, <a href="{settings.FRONTEND_URL}">acesse o sistema</a> para dar continuidade ao processo.</p>
                        <p>O prazo final para análise deste edital é <span class="deadline">{end_date_formatted}</span>.</p>

                        <p class="footer">
                            Este é um e-mail automático, por favor não responda.<br>
                            IFRS - Campus Restinga
                        </p>
                    </div>
                </body>
                </html>
                """

            message_html = textwrap.dedent(html_body)
            result = gmail_service.send_email(
                to=recipient_email,
                subject=subject,
                message_text=message_html,
                message_type='html'
            )

            if result:
                return Response({"detail": "Notificação de E-mail enviado com sucesso."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Falha ao enviar o e-mail."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            print(f"Erro na view SendReminderEmailView: {e}")
            return Response({"error": "Ocorreu um erro inesperado no servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendReminderResumeView(APIView):

    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            latest_notice = Notice.objects.order_by('-publication_date').first()
            if not latest_notice:
                return Response({"detail": "Nenhum edital encontrado."}, status=status.HTTP_404_NOT_FOUND)
            end_date_formatted = latest_notice.proposal_analysis_end.strftime('%d/%m/%Y')
            pending_statuses = [
                RequestStatus.IN_ANALYSIS_BY_COORDINATOR,
                RequestStatus.IN_ANALYSIS_BY_PROFESSOR,
                RequestStatus.IN_APPROVAL_BY_COORDINATOR,
                RequestStatus.RETURNED_BY_COORDINATOR,
            ]

            pending_steps = Step.objects.filter(
                Q(current=True) &
                Q(status__in=pending_statuses) &
                (Q(recognition_form__notice=latest_notice) | Q(certification_form__notice=latest_notice))
            ).select_related(
                'responsible', 
                'recognition_form__student', 'recognition_form__discipline', 'recognition_form__course',
                'certification_form__student', 'certification_form__discipline', 'certification_form__course'
            )

            if not pending_steps.exists():
                return Response({"detail": "Nenhuma solicitação pendente encontrada para notificar."}, status=status.HTTP_200_OK)

            tasks_by_responsible = defaultdict(list)
            for step in pending_steps:
                if step.responsible:
                    tasks_by_responsible[step.responsible].append(step)

            if not tasks_by_responsible:
                return Response({"detail": "Nenhuma solicitação pendente com responsável atribuído foi encontrada."}, status=status.HTTP_200_OK)

            gmail_service = GmailService()
            emails_sent_count = 0

            for responsible, steps in tasks_by_responsible.items():
                recipient_name = responsible.name
                recipient_email = responsible.email

                if not recipient_email:
                    continue

                tasks_html_list = ""
                for step in steps:
                    form = step.recognition_form or step.certification_form
                    if form:
                        request_type = "Aproveitamento de Estudos" if isinstance(form, RecognitionOfPriorLearning) else "Certificação de Conhecimento"
                        student_name = form.student.name
                        discipline_name = form.discipline.name
                        course_name = form.course.name

                        tasks_html_list += f"""
                        <li>
                            <div><strong>{request_type}:</strong> {student_name}</div>
                            <div class="task-details-item"><strong>Disciplina:</strong> {discipline_name}</div>
                            <div class="task-details-item"><strong>Curso:</strong> {course_name}</div>
                            <div class="task-details-item"><strong>Status Atual:</strong> {step.get_status_display()}</div>
                        </li>
                        """
                subject = "Resumo de Solicitações Pendentes no Sistema de Aproveitamento"
                html_body = f"""
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ 
                            max-width: 600px; 
                            margin: 20px;
                            padding: 20px; 
                            border: 1px solid #ddd; 
                            border-radius: 8px; 
                        }}
                        .header {{ font-size: 1.2em; font-weight: bold; color: #444; }}
                        .details {{ margin-top: 15px; }}
                        .task-list {{ list-style-type: none; padding-left: 0; }}
                        .task-list li {{ 
                            background-color: #f9f9f9; 
                            border-left: 3px solid #ffc107; 
                            padding: 10px; 
                            margin-bottom: 8px; 
                            border-radius: 4px;
                        }}
                        .task-details-item {{
                            margin: 4px 0 0 15px;
                            font-size: 0.95em;
                            color: #555;
                        }}
                        .deadline-highlight {{ color: #dc3545; font-weight: bold; }}
                        .footer {{ margin-top: 25px; font-size: 0.9em; color: #777; }}
                        a {{ color: #007bff; text-decoration: none; }}
                        a:hover {{ text-decoration: underline; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p class="header">Olá, {recipient_name},</p>
                        <p>Este é um resumo das solicitações de componentes que estão aguardando sua análise. O prazo final para análise deste edital é <span class="deadline-highlight">{end_date_formatted}</span>.</p>
                        <div class="details">
                            <p><strong>Total de Pendências:</strong> {len(steps)}</p>
                            <ul class="task-list">
                                {tasks_html_list}
                            </ul>
                        </div>
                        <p>Por favor, <a href="{settings.FRONTEND_URL}">acesse o sistema</a> para dar continuidade aos processos.</p>
                        <p class="footer">
                            Este é um e-mail automático, por favor não responda.<br>
                            IFRS - Campus Restinga
                        </p>
                    </div>
                </body>
                </html>
                """

                message_html = textwrap.dedent(html_body)
                email_sent = gmail_service.send_email(
                    to=recipient_email,
                    subject=subject,
                    message_text=message_html,
                    message_type='html'
                )
                if email_sent:
                    emails_sent_count += 1

            return Response(
                {"detail": f"{emails_sent_count} responsáveis foram notificados com sucesso."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print(f"Erro na view SendReminderResumeView: {e}")
            return Response({"error": "Ocorreu um erro inesperado no servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)