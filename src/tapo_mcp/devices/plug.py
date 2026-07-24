import logging
from typing import Any

from tapo import ApiClient

from ..core.exceptions import PlugError

logger = logging.getLogger(__name__)


def _parse_power(power_data: Any) -> tuple[float, float, float]:
    current_power = 0.0
    voltage = 220.0
    current_a = 0.0
    if power_data is None:
        return current_power, voltage, current_a
    for attr in ("current_power", "power", "power_mw", "power_w"):
        val = getattr(power_data, attr, None)
        if val is not None:
            current_power = float(val)
            if attr == "power_mw":
                current_power /= 1000.0
            break
    for attr in ("voltage", "voltage_v", "voltage_mv"):
        val = getattr(power_data, attr, None)
        if val is not None:
            voltage = float(val)
            if attr == "voltage_mv":
                voltage /= 1000.0
            break
    for attr in ("current", "current_a", "current_ma"):
        val = getattr(power_data, attr, None)
        if val is not None:
            current_a = float(val)
            if attr == "current_ma":
                current_a /= 1000.0
            break
    return current_power, voltage, current_a


class PlugManager:
    def __init__(self, email: str = "", password: str = ""):
        self._email = email
        self._password = password
        self._client: Any = None

    async def _ensure_client(self):
        if self._client is not None:
            return
        self._client = await ApiClient(self._email, self._password)

    async def discover(self) -> list[dict]:
        await self._ensure_client()
        try:
            devices = await self._client.get_device_list()
            plugs = []
            for d in devices:
                info = {}
                for attr in ("device_id", "device_name", "device_model", "mac", "ip_address", "status", "type"):
                    val = getattr(d, attr, None) or d.get(attr) if isinstance(d, dict) else None
                    if val is not None:
                        info[attr] = val
                if "type" not in info:
                    info["type"] = getattr(d, "category", "plug")
                info["device_type"] = "plug"
                plugs.append(info)
            return plugs
        except Exception as e:
            raise PlugError(f"Failed to discover plugs: {e}") from e

    async def get_status(self, device_id: str) -> dict:
        await self._ensure_client()
        try:
            device = await self._client.get_device(device_id)
            info = await device.get_device_info()
            power_data = await device.get_current_power()
            power_w, voltage_v, current_a = _parse_power(power_data)
            daily = getattr(info, "daily_energy_kwh", None) or getattr(power_data, "daily_energy_kwh", None)
            monthly = getattr(info, "monthly_energy_kwh", None) or getattr(power_data, "monthly_energy_kwh", None)
            return {
                "device_id": device_id,
                "power_w": power_w,
                "voltage_v": voltage_v,
                "current_a": current_a,
                "daily_energy_kwh": daily,
                "monthly_energy_kwh": monthly,
                "power_state": bool(getattr(info, "device_on", False)),
                "status": "online",
            }
        except Exception as e:
            raise PlugError(f"Failed to get status for {device_id}: {e}") from e

    async def toggle(self, device_id: str, state: bool | None = None) -> dict:
        await self._ensure_client()
        try:
            device = await self._client.get_device(device_id)
            info = await device.get_device_info()
            current = bool(getattr(info, "device_on", False))
            target = state if state is not None else not current
            if target:
                await device.on()
            else:
                await device.off()
            return {"device_id": device_id, "power_state": target, "previous_state": current}
        except Exception as e:
            raise PlugError(f"Failed to toggle {device_id}: {e}") from e

    async def get_energy_history(self, device_id: str, hours: int = 24) -> list[dict]:
        await self._ensure_client()
        try:
            device = await self._client.get_device(device_id)
            raw = await device.get_energy_data()
            data_points = []
            for entry in raw or []:
                if isinstance(entry, dict):
                    ts = entry.get("timestamp", 0)
                    data_points.append(
                        {
                            "timestamp": ts,
                            "power_w": entry.get("power", 0),
                        }
                    )
            return data_points
        except Exception as e:
            raise PlugError(f"Failed to get energy history for {device_id}: {e}") from e
