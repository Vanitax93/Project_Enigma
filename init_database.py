import logging
from app import app, db  # Import app and db from your main app file

# Configure logging specifically for this script if needed,
# or rely on the app's logging configuration if run within its context.
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def initialize_database():
    """
    Creates all database tables defined by the SQLAlchemy models
    within the Flask application context.
    This should be run once during setup or when models change.
    """
    # app.app_context() is crucial for SQLAlchemy to know which app's
    # database configuration and models to use.
    with app.app_context():
        logging.info(
            f"Attempting to create database tables for {app.config['SQLALCHEMY_DATABASE_URI']}..."
        )
        try:
            # This command creates tables based on the models imported via 'app'
            # It won't drop existing tables or data.
            db.create_all()
            logging.info("Database tables checked/created successfully.")
            # You could add checks here to see if tables were actually created
            # from sqlalchemy import inspect
            # inspector = inspect(db.engine)
            # tables = inspector.get_table_names()
            # logging.info(f"Tables present: {tables}")
        except Exception as e:
            # Log the full traceback for debugging
            logging.exception(f"Error creating database tables: {e}")


if __name__ == "__main__":
    print("Starting database initialization...")
    initialize_database()
    print("Database initialization finished.")
