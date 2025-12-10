from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from db.models import db, User
from functools import wraps


# Decorador personalizado para verificar se é Admin
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_name = get_jwt_identity()
        user = User.query.filter_by(username=current_user_name).first()
        if not user or not user.is_admin:
            return {"msg": "Acesso negado. Requer privilégios de Admin."}, 403
        return fn(*args, **kwargs)

    return wrapper


class UserManagement(Resource):
    @jwt_required()
    @admin_required
    def get(self):
        """Lista todos os usuários"""
        users = User.query.all()
        return [{
            "id": u.id,
            "username": u.username,
            "is_admin": u.is_admin
        } for u in users], 200

    @jwt_required()
    @admin_required
    def post(self):
        """Cria um novo usuário"""
        data = request.json
        username = data.get('username')
        password = data.get('password')
        is_admin = data.get('is_admin', False)

        if not username or not password:
            return {"msg": "Usuário e senha são obrigatórios"}, 400

        if User.query.filter_by(username=username).first():
            return {"msg": "Usuário já existe"}, 400

        new_user = User(
            username=username,
            password_hash=generate_password_hash(password),
            is_admin=is_admin
        )

        db.session.add(new_user)
        db.session.commit()

        return {"msg": f"Usuário {username} criado com sucesso"}, 201

    @jwt_required()
    @admin_required
    def delete(self):
        """Deleta um usuário (passando ID na URL ou JSON)"""
        # Vamos pegar o ID da query param: /api/users?id=1
        user_id = request.args.get('id')

        if not user_id:
            return {"msg": "ID do usuário obrigatório"}, 400

        user = User.query.get(user_id)
        if not user:
            return {"msg": "Usuário não encontrado"}, 404

        # Impede que o usuário se delete
        current_user_name = get_jwt_identity()
        if user.username == current_user_name:
            return {"msg": "Você não pode deletar a si mesmo"}, 400

        db.session.delete(user)
        db.session.commit()
        return {"msg": "Usuário deletado"}, 200