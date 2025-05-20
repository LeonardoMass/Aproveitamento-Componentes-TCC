from googleapiclient.discovery import build
from api import settings
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload

from tempfile import NamedTemporaryFile
from google.oauth2 import service_account
import io

class GoogleDriveService:
    def __init__(self):
        self.credentials = service_account.Credentials.from_service_account_info(
            settings.GOOGLE_DRIVE_CREDENTIALS_JSON,
            scopes=settings.GOOGLE_DRIVE_OAUTH2_SCOPE
        )
        self.service = build('drive', 'v3', credentials=self.credentials)

    def upload_file(self, file, folder_id='1GQ-Er_MDLIVPa21k9bnAt-7wrubkfFcL'):
        print(f"Nome do arquivo: {file.name}")
        try:
            file_metadata = {
                'name': file.name,
                'parents': [folder_id] if folder_id else []
            }
            
            media = MediaIoBaseUpload(
                file.file,
                mimetype=file.content_type,
                resumable=True
            )
            
            uploaded_file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()

            return uploaded_file.get('id')
        
        except Exception as e:
            print(f"Erro no upload: {str(e)}")
            return None

    def download_file(self, file_id):
        try:
            file_data = self.service.files().get(
                fileId=file_id,
                fields='name, mimeType'
            ).execute()

            request = self.service.files().get_media(fileId=file_id)
            file_stream = io.BytesIO()
            downloader = MediaIoBaseDownload(file_stream, request)
            
            done = False
            while not done:
                status, done = downloader.next_chunk()
            
            file_stream.seek(0)
            return file_stream, file_data['name']
        
        except Exception as e:
            print(f"Erro no download: {str(e)}")
            return None, None

    def delete_file(self, file_id):
        try:
            self.service.files().delete(fileId=file_id).execute()
            return True
        except Exception as e:
            print(f"Erro ao deletar: {str(e)}")
            return False
    
    def get_or_create_folder(self, folder_name, parent_folder_id = '1GQ-Er_MDLIVPa21k9bnAt-7wrubkfFcL'):
        try:
            # Verifica se a pasta já existe
            query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and '{parent_folder_id}' in parents"
            response = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            folders = response.get('files', [])

            if folders:
                return folders[0]['id']
            else:
                # Cria a pasta se não existir
                file_metadata = {
                    'name': folder_name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [parent_folder_id]
                }
                folder = self.service.files().create(
                    body=file_metadata,
                    fields='id'
                ).execute()
                return folder.get('id')
        except Exception as e:
            print(f"Erro ao obter/criar pasta: {str(e)}")
            return None