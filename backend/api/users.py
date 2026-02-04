from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from db.models import db, User
from functools import wraps

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_name = get_jwt_identity()
        user = User.query.filter_by(username=current_user_name).first()
        if not user or (not user.is_admin and user.role != 'ADMIN'):
            return {"msg": "Acesso negado. Requer privilégios de Admin."}, 403
        return fn(*args, **kwargs)
    return wrapper


class UserProfileResource(Resource):
    @jwt_required()
    def get(self):
        """Retorna os dados do usuário logado"""
        current_user_name = get_jwt_identity()
        user = User.query.filter_by(username=current_user_name).first()
        
        if not user: return {"msg": "Usuário não encontrado"}, 404

        return {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "avatar_url": user.avatar_url,
            "is_admin": user.is_admin
        }, 200

    @jwt_required()
    def put(self):
        """Usuário atualiza seus próprios dados (Nome, Avatar, Senha)"""
        current_user_name = get_jwt_identity()
        user = User.query.filter_by(username=current_user_name).first()
        
        if not user: return {"msg": "Usuário não encontrado"}, 404
        
        data = request.json
        

        if 'full_name' in data: user.full_name = data['full_name']
        if 'avatar_url' in data: user.avatar_url = data['avatar_url']
        

        if 'password' in data and data['password'].strip():
            user.password_hash = generate_password_hash(data['password'])
            
        db.session.commit()
        return {"msg": "Perfil atualizado com sucesso!"}, 200


class UserManagement(Resource):
    @jwt_required()
    @admin_required
    def get(self):
        users = User.query.all()
        return [{
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "is_admin": u.is_admin
        } for u in users], 200

    @jwt_required()
    @admin_required
    def post(self):
        data = request.json
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'USER')
        
        is_admin = True if role == 'ADMIN' else False

        if not username or not password:
            return {"msg": "Usuário e senha são obrigatórios"}, 400

        if User.query.filter_by(username=username).first():
            return {"msg": "Usuário já existe"}, 400

        new_user = User(
            username=username,
            password_hash=generate_password_hash(password),
            role=role,
            is_admin=is_admin,
            full_name=username
        )

        db.session.add(new_user)
        db.session.commit()

        return {"msg": f"Usuário {username} criado com sucesso"}, 201

    @jwt_required()
    @admin_required
    def put(self):
        data = request.json
        user_id = data.get('id')
        role = data.get('role')
        password = data.get('password')

        if not user_id: return {"msg": "ID obrigatório"}, 400
        user = User.query.get(user_id)
        if not user: return {"msg": "Usuário 404"}, 404

        if role:
            user.role = role
            user.is_admin = (role == 'ADMIN')

        if password and password.strip():
            user.password_hash = generate_password_hash(password)

        db.session.commit()
        return {"msg": f"Usuário {user.username} atualizado"}, 200

    @jwt_required()
    @admin_required
    def delete(self):
        user_id = request.args.get('id')
        if not user_id: return {"msg": "ID obrigatório"}, 400

        user = User.query.get(user_id)
        if not user: return {"msg": "Usuário 404"}, 404

        current_user_name = get_jwt_identity()
        if user.username == current_user_name:
            return {"msg": "Você não pode deletar a si mesmo"}, 400

        db.session.delete(user)
        db.session.commit()
        return {"msg": "Usuário deletado"}, 200