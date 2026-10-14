from app.database.session import Base, engine
from app import models


def init_db():
    Base.metadata.create_all(bind=engine)
    print("HRMS database initialized successfully.")
    print("Tables:", ", ".join(sorted(Base.metadata.tables.keys())))


if __name__ == "__main__":
    init_db()
