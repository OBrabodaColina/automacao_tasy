from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default="USER") 
    avatar_url = db.Column(db.String(255)) 
    is_admin = db.Column(db.Boolean, default=False)

class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    status = db.Column(db.String(20), default="EM_ANDAMENTO")
    automation_type = db.Column(db.String(50), default="BOLETOS")
    total = db.Column(db.Integer, default=0)
    concluidos = db.Column(db.Integer, default=0)
    start_time = db.Column(db.DateTime, default=datetime.now)
    end_time = db.Column(db.DateTime, nullable=True)
    resultados = db.relationship('JobResult', backref='job', lazy=True, cascade="all, delete-orphan")

class JobResult(db.Model):
    __tablename__ = 'job_results'
    id = db.Column(db.Integer, primary_key=True)
    nr_titulo = db.Column(db.String(50))
    status = db.Column(db.String(20))
    detalhe = db.Column(db.Text)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)