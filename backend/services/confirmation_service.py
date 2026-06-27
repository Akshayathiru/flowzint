from models import FarmerConfirmation


def confirm_farmer(db, data):

    confirmation = FarmerConfirmation(
        pool_id=data.pool_id,
        phone=data.phone,
        accepted="YES" if data.accepted else "NO"
    )

    db.add(confirmation)
    db.commit()

    return {
        "message": "Farmer confirmation saved"
    }