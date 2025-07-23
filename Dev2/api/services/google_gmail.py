from django.conf import settings
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import base64
from email.mime.text import MIMEText
from googleapiclient.errors import HttpError


class GmailService:
    """
    Serviço para enviar e-mails através da API do Gmail usando credenciais
    de uma conta dedicada (obtidas via fluxo OAuth 2.0 com refresh_token).
    """
    def __init__(self):
        self.service = None
        try:
            creds_info = {
                "client_id": settings.GMAIL_SENDER_CLIENT_ID,
                "client_secret": settings.GMAIL_SENDER_CLIENT_SECRET,
                "refresh_token": settings.GMAIL_SENDER_REFRESH_TOKEN,
                "token_uri": "https://oauth2.googleapis.com/token",
            }
            scopes = ['https://www.googleapis.com/auth/gmail.send']
            self.credentials = Credentials.from_authorized_user_info(info=creds_info, scopes=scopes)
            self.service = build('gmail', 'v1', credentials=self.credentials)

        except AttributeError as e:
            print(f"Erro de configuração: Verifique se as variáveis GMAIL_SENDER_* estão no seu settings.py e .env. Detalhe: {e}")
        except Exception as e:
            print(f"Erro ao inicializar GmailService: {e}")

    def send_email(self, to, subject, message_text, message_type='plain'):
        if not self.service:
            print("Serviço do Gmail não foi inicializado devido a um erro anterior. Não é possível enviar e-mail.")
            return None

        try:
            message = MIMEText(message_text, message_type, 'utf-8')
            
            message['to'] = to
            message['from'] = 'me' 
            message['subject'] = subject
            raw_message_body = {'raw': base64.urlsafe_b64encode(message.as_bytes()).decode()}
            sent_message = self.service.users().messages().send(
                userId='me',
                body=raw_message_body
            ).execute()
            
            print(f"E-mail para '{to}' enviado com sucesso. ID da Mensagem: {sent_message.get('id')}")
            return sent_message

        except HttpError as error:
            print(f"Ocorreu um erro HTTP ao enviar o e-mail para '{to}': {error}")
            return None
        except Exception as e:
            print(f"Ocorreu um erro inesperado ao enviar o e-mail para '{to}': {e}")
            return None