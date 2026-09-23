import re


AUTOMOTIVE_TERMS = {
    # General
    "car",
    "vehicle",
    "automobile",
    "auto",

    # Engine
    "engine",
    "motor",
    "spark plug",
    "ignition",
    "cylinder",
    "alternator",
    "starter",

    # Fluids
    "oil",
    "engine oil",
    "coolant",
    "brake fluid",
    "transmission fluid",

    # Brakes
    "brake",
    "brakes",
    "braking",
    "brake pad",
    "brake disc",
    "rotor",

    # Transmission
    "gear",
    "gears",
    "gearbox",
    "transmission",
    "clutch",

    # Steering / suspension
    "steering",
    "steering wheel",
    "suspension",
    "shock absorber",
    "strut",

    # Wheels
    "tyre",
    "tire",
    "wheel",
    "alignment",
    "puncture",

    # Electrical
    "battery",
    "headlight",
    "headlights",
    "dashboard",
    "fuse",
    "electrical",

    # Cooling
    "overheating",
    "overheat",
    "radiator",
    "thermostat",
    "cooling",

    # Exhaust
    "exhaust",
    "muffler",
    "smoke",

    # Common symptoms
    "noise",
    "clicking",
    "knocking",
    "rattling",
    "vibration",
    "vibrating",
    "squeaking",
    "squealing",
    "grinding",
    "leak",
    "leaking",
    "smell",
    "warning light",
    "check engine",
    "starting problem",
    "won't start",
    # Brands & Vehicles
    "honda",
    "toyota",
    "hyundai",
    "maruti",
    "suzuki",
    "tata",
    "mahindra",
    "ford",
    "chevrolet",
    "nissan",
    "kia",
    "volkswagen",
    "bmw",
    "audi",
    "mercedes",
    "sedan",
    "suv",
    "hatchback",
    "truck",
    "van",

    # Heating & AC
    "ac",
    "air conditioner",
    "heater",
    "heating",
    "blower",
    "fan",
    "compressor",

    # Common symptoms & terms
    "mileage",
    "fuel",
    "petrol",
    "diesel",
    "pickup",
    "stalling",
    "stalls",
    "misfire",
    "jerking",
    "jerks",
    "pedal",
    "accelerator",
    "speedometer",
    "odometer",
}

GREETING_PATTERNS = {
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "greetings",
    "help",
    "who are you",
    "how are you",
}


def is_greeting(text: str) -> bool:
    """Check if the text is a simple greeting or introductory question."""
    if not text:
        return False
    cleaned = re.sub(r"[^\w\s]", "", text.lower()).strip()
    return cleaned in GREETING_PATTERNS or any(
        cleaned.startswith(f"{g} ") or cleaned == g for g in GREETING_PATTERNS
    )


def get_greeting_response() -> str:
    return (
        "Hello! I'm CarBuddy V2, your senior automotive technician. "
        "What vehicle (make, model, year) are you driving, and what symptoms or issue are you experiencing today?"
    )


def is_automotive_query(text: str) -> bool:
    """
    Determine whether a message appears to be related
    to cars or mechanical/automotive problems.
    """
    if not text:
        return False

    text = text.lower().strip()

    # Direct keyword matching
    for term in AUTOMOTIVE_TERMS:
        if term in text:
            return True

    return False


def get_rejection_message() -> str:
    return (
        "I'm CarBuddy V2, a virtual automobile mechanic. "
        "I can only help with car and mechanical-related problems. "
        "Please describe an issue you're experiencing with your vehicle."
    )