from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..services import GmailService
from django.conf import settings
import textwrap

class SendReminderEmailView(APIView):
    def post(self, request):
        try:
            gmail_service = GmailService()
            solicitacao = request.data
            steps_list = solicitacao.get('steps', [])
            if not steps_list:
                return Response({"error": "Nenhum passo encontrado na solicitação."}, status=status.HTTP_400_BAD_REQUEST)

            current_step = None
            for step in steps_list:
                if step.get('current') is True:
                    current_step = step
                    break 

            if not current_step:
                return Response({"error": "Passo atual (current=True) não encontrado."}, status=status.HTTP_400_BAD_REQUEST)

            responsible_data = current_step.get('responsible')
            if not responsible_data:
                 return Response({"error": "Dados do responsável não encontrados no passo atual."}, status=status.HTTP_400_BAD_REQUEST)

            recipient_email = responsible_data.get('email')
            recipient_name = responsible_data.get('name', 'Prezado(a)')
            
            if not recipient_email:
                return Response({"error": "E-mail do responsável não encontrado."}, status=status.HTTP_400_BAD_REQUEST)
            
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