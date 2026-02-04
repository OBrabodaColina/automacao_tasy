from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from db.models import User

class Login(Resource):
    def post(self):
        username = request.json.get('username')
        password = request.json.get('password')

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            access_token = create_access_token(identity=username)
            return {
                'access_token': access_token,
                'username': user.username,
                'full_name': user.full_name or user.username,
                'role': user.role,
                'avatar': user.avatar_url,
                'is_admin': user.is_admin
            }, 200

        return {'msg': 'Usuário ou senha incorretos'}, 401