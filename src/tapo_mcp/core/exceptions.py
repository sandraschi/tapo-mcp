class TapoError(Exception):
    def __init__(self, message: str, error_type: str = "TAPO_ERROR", context: dict | None = None):
        super().__init__(message)
        self.error_type = error_type
        self.context = context or {}


class AuthError(TapoError):
    def __init__(self, message: str = "Authentication failed", context: dict | None = None):
        super().__init__(message, "AUTH_ERROR", context)


class DeviceNotFoundError(TapoError):
    def __init__(self, device_id: str, device_type: str = "device"):
        super().__init__(f"{device_type} '{device_id}' not found", "DEVICE_NOT_FOUND")


class CameraError(TapoError):
    def __init__(self, message: str, context: dict | None = None):
        super().__init__(message, "CAMERA_ERROR", context)


class PlugError(TapoError):
    def __init__(self, message: str, context: dict | None = None):
        super().__init__(message, "PLUG_ERROR", context)
