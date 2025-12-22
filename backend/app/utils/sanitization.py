import html
import re


def sanitize_string(value, max_length=None):
    """
    Sanitize a string input.

    Args:
        value: The string to sanitize
        max_length: Optional maximum length to truncate to

    Returns:
        Sanitized string
    """
    if value is None:
        return None

    if not isinstance(value, str):
        value = str(value)

    # Strip leading/trailing whitespace
    value = value.strip()

    # Remove null bytes
    value = value.replace('\x00', '')

    # Truncate if max_length specified
    if max_length and len(value) > max_length:
        value = value[:max_length]

    return value


def escape_html(value):
    """
    Escape HTML special characters.

    Args:
        value: The string to escape

    Returns:
        HTML-escaped string
    """
    if value is None:
        return None

    if not isinstance(value, str):
        value = str(value)

    return html.escape(value)


def sanitize_phone(phone):
    """
    Sanitize and normalize phone number.

    Args:
        phone: The phone number to sanitize

    Returns:
        Sanitized phone number (digits only, with optional + prefix)
    """
    if phone is None:
        return None

    # Keep only digits and + sign
    sanitized = re.sub(r'[^\d+]', '', phone)

    # Ensure + is only at the beginning
    if '+' in sanitized:
        sanitized = '+' + sanitized.replace('+', '')

    return sanitized


def sanitize_email(email):
    """
    Sanitize email address.

    Args:
        email: The email address to sanitize

    Returns:
        Sanitized and lowercased email
    """
    if email is None:
        return None

    # Strip whitespace and convert to lowercase
    return email.strip().lower()
