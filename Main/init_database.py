import logging
from app import app, db


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def initialize_database():
    """
    Creates all database tables defined by the SQLAlchemy models
    within the Flask application context.
    """
    # The app_context() is crucial! It sets up the necessary
    # context for SQLAlchemy to know which app's database configuration to use.
    with app.app_context():
        logging.info("Attempting to create database tables...")
        try:
            db.create_all()
            logging.info("Database tables checked/created successfully.")
        except Exception as e:
            logging.error(f"Error creating database tables: {e}")
            logging.exception("Detailed error:")  # Log the full traceback


if __name__ == "__main__":
    initialize_database()
    print("Database initialization finished.")
