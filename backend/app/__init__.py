from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from marshmallow import ValidationError
from redis import Redis
import os

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
# No Marshmallow instance needed here, it's used in schemas directly

def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object('app.config.Config')

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # Setup CORS
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}}, supports_credentials=True)

    # Initialize Redis for rate limiting (if using Flask-Limiter later)
    # try:
    #     app.redis = Redis.from_url(app.config['REDIS_URL'], decode_responses=True)
    # except Exception:
    #     app.redis = None

    # Register blueprints (routes will be added here later)
    from app.routes.auth_routes import auth_bp
    from app.routes.patient_routes import patient_bp
    from app.routes.doctor_routes import doctor_bp
    from app.routes.appointment_routes import appointment_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patient_bp, url_prefix='/api/patients')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctors')
    app.register_blueprint(appointment_bp, url_prefix='/api/appointments')


    # Error Handlers
    @app.errorhandler(ValidationError)
    def handle_marshmallow_validation(err):
        return jsonify(
            error="validation_error",
            message="Validation failed for some fields.",
            errors=err.messages
        ), 400

    @app.errorhandler(404)
    def handle_not_found(err):
        return jsonify(
            error="not_found",
            message="The requested resource was not found."
        ), 404

    @app.errorhandler(500)
    def handle_internal_server_error(err):
        return jsonify(
            error="internal_server_error",
            message="An unexpected error occurred on the server."
        ), 500

    return app

from app import models  # Import models to register them with SQLAlchemy