from app import app
from db.models import db, User
from werkzeug.security import generate_password_hash


def criar_admin():
    with app.app_context():
        # ATENÇÃO: Se der erro de coluna faltando, apague o arquivo .db e rode de novo
        db.create_all()

        username = input("Digite o usuário admin: ")
        password = input("Digite a senha: ")

        if User.query.filter_by(username=username).first():
            print("Usuário já existe!")
            return

        novo_user = User(
            username=username,
            password_hash=generate_password_hash(password),
            is_admin=True  # <--- Força True para o primeiro usuário
        )

        db.session.add(novo_user)
        db.session.commit()
        print(f"Admin {username} criado com sucesso!")


if __name__ == "__main__":
    criar_admin()