import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models.user import User


def main():
    email = input("Admin email: ").strip().lower()
    password = getpass.getpass("Admin password (12-128 characters): ")

    if not 12 <= len(password) <= 128:
        print("Password must contain between 12 and 128 characters.")
        return

    with SessionLocal() as db:
        existing = db.scalar(select(User).where(User.email == email))

        if existing:
            print("This email already has an account.")
            return

        admin = User(
            email=email,
            hashed_password=hash_password(password),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("Admin account created successfully.")
        print("Email:", email)


if __name__ == "__main__":
    main()
