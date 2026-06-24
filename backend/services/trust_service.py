from models import TrustScore


def update_trust_score(db, trust_data):

    trust = db.query(TrustScore).filter(
        TrustScore.phone == trust_data.phone
    ).first()

    # First time farmer
    if trust is None:
        trust = TrustScore(
            phone=trust_data.phone,
            score=100
        )
        db.add(trust)

    # Increase score
    if trust_data.delivered:
        trust.score += 5

    # Decrease score
    else:
        trust.score -= 20

    db.commit()

    return {
        "phone": trust.phone,
        "score": trust.score
    }


def get_trust_score(db, phone):

    trust = db.query(TrustScore).filter(
        TrustScore.phone == phone
    ).first()

    if trust is None:
        return {
            "phone": phone,
            "score": 100
        }

    return {
        "phone": trust.phone,
        "score": trust.score
    }