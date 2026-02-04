from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from api.auth import Login
from api.titulos import Titulos
# Importe ReenviarFalhas aqui
from api.automacao import ExecutarAutomacao, StatusAutomacao, ListarJobs, DownloadLog, ReenviarFalhas
from api.users import UserManagement, UserProfileResource
from db.models import db
from api.recurso_proprio import ListarAutorizacoes, ExecutarAutomacaoRecurso
from api.dashboard import DashboardStats

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
jwt = JWTManager(app)
db.init_app(app)

with app.app_context():
    db.create_all()

api = Api(app)

api.add_resource(UserManagement, '/api/users')
api.add_resource(Login, '/api/login')
api.add_resource(Titulos, '/api/titulos')
api.add_resource(ExecutarAutomacao, '/api/executar-automacao')
api.add_resource(StatusAutomacao, '/api/status-automacao/<string:job_id>')
api.add_resource(ReenviarFalhas, '/api/jobs/<string:job_id>/retry')
api.add_resource(ListarJobs, '/api/jobs')
api.add_resource(DownloadLog, '/api/jobs/<string:job_id>/download')
api.add_resource(ListarAutorizacoes, '/api/recurso-proprio/listar')
api.add_resource(ExecutarAutomacaoRecurso, '/api/recurso-proprio/executar')
api.add_resource(DashboardStats, '/api/dashboard')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5098)