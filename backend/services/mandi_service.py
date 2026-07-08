def get_mandi_price(crop, location):

    mandi_prices = {
        "Tomato": 12,
        "Potato": 20,
        "Onion": 18,
        "Rice": 28,
        "Wheat": 24
    }

    price = mandi_prices.get(crop, 10)

    return {
        "crop": crop,
        "location": location,
        "market_price": price
    }