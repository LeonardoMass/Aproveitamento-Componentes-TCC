import google_auth_oauthlib.flow
# ARQUIVO OAUTH2.JSON BAIXANDO NO GOOGLE CLOUD CONSOLE
CLIENT_SECRETS_FILE = "client_secret_desktop.json"
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
    CLIENT_SECRETS_FILE, SCOPES)
credentials = flow.run_local_server(port=0)

print("Refresh Token:")
print(credentials.refresh_token)

print("\nCredenciais completas em formato JSON:")
creds_dict = {
    'token': credentials.token,
    'refresh_token': credentials.refresh_token,
    'token_uri': credentials.token_uri,
    'client_id': credentials.client_id,
    'client_secret': credentials.client_secret,
    'scopes': credentials.scopes
}
import json
print(json.dumps(creds_dict, indent=4))