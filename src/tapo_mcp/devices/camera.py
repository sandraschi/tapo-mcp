import asyncio
import logging
import os
from typing import Any

from pytapo import Tapo

from ..core.exceptions import CameraError

logger = logging.getLogger(__name__)


class CameraManager:
    def __init__(self):
        self._cameras: dict[str, Any] = {}

    def _make_tapo(self, host: str, username: str, password: str) -> Any:
        return Tapo(host, username, password)

    async def _run_in_thread(self, fn, *args):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, fn, *args)

    def _register(self, host: str, username: str, password: str) -> str:
        cid = f"tapo_{host.replace('.', '_')}"
        if cid not in self._cameras:
            self._cameras[cid] = {
                "host": host,
                "username": username,
                "password": password,
                "id": cid,
            }
        return cid

    def get_cameras(self) -> list[dict]:
        return [{"id": cid, "host": c["host"], "name": c.get("name", cid)} for cid, c in self._cameras.items()]

    async def get_status(self, camera_id: str) -> dict:
        cam = self._cameras.get(camera_id)
        if not cam:
            raise CameraError(f"Camera {camera_id} not registered")
        tapo = self._make_tapo(cam["host"], cam["username"], cam["password"])
        try:
            info = await self._run_in_thread(lambda: tapo.getInfo())
            return {
                "camera_id": camera_id,
                "host": cam["host"],
                "status": "online" if info else "unknown",
                "info": info or {},
            }
        except Exception as e:
            raise CameraError(f"Failed to get camera status: {e}") from e

    async def get_snapshot(self, camera_id: str) -> bytes | None:
        cam = self._cameras.get(camera_id)
        if not cam:
            raise CameraError(f"Camera {camera_id} not registered")
        tapo = self._make_tapo(cam["host"], cam["username"], cam["password"])
        try:
            data = await self._run_in_thread(lambda: tapo.getSnapshot())
            if isinstance(data, str):
                import base64

                data = base64.b64decode(data)
            return data
        except Exception as e:
            raise CameraError(f"Failed to get snapshot: {e}") from e

    async def ptz_move(self, camera_id: str, direction: str) -> dict:
        cam = self._cameras.get(camera_id)
        if not cam:
            raise CameraError(f"Camera {camera_id} not registered")
        tapo = self._make_tapo(cam["host"], cam["username"], cam["password"])
        cmd_map = {
            "up": "move_up",
            "down": "move_down",
            "left": "move_left",
            "right": "move_right",
        }
        cmd = cmd_map.get(direction)
        if not cmd:
            raise CameraError(f"Invalid PTZ direction: {direction}")
        try:
            fn = getattr(tapo, cmd)
            await self._run_in_thread(fn)
            return {"camera_id": camera_id, "direction": direction, "success": True}
        except Exception as e:
            raise CameraError(f"PTZ move failed: {e}") from e

    async def set_privacy_mode(self, camera_id: str, enabled: bool) -> dict:
        cam = self._cameras.get(camera_id)
        if not cam:
            raise CameraError(f"Camera {camera_id} not registered")
        tapo = self._make_tapo(cam["host"], cam["username"], cam["password"])
        try:
            fn = tapo.setPrivacyMode if enabled else tapo.disablePrivacyMode
            await self._run_in_thread(fn)
            return {"camera_id": camera_id, "privacy_mode": enabled, "success": True}
        except Exception as e:
            raise CameraError(f"Privacy mode toggle failed: {e}") from e

    async def set_led(self, camera_id: str, enabled: bool) -> dict:
        cam = self._cameras.get(camera_id)
        if not cam:
            raise CameraError(f"Camera {camera_id} not registered")
        tapo = self._make_tapo(cam["host"], cam["username"], cam["password"])
        try:
            fn = tapo.setLedEnabled if enabled else tapo.setLedDisabled
            await self._run_in_thread(fn)
            return {"camera_id": camera_id, "led_enabled": enabled, "success": True}
        except Exception as e:
            raise CameraError(f"LED toggle failed: {e}") from e

    async def get_stream_url(self, camera_id: str) -> str | None:
        cam = self._cameras.get(camera_id)
        if not cam:
            raise CameraError(f"Camera {camera_id} not registered")
        tapo = self._make_tapo(cam["host"], cam["username"], cam["password"])
        try:
            url = await self._run_in_thread(lambda: tapo.getStreamUrl())
            return url
        except Exception as e:
            raise CameraError(f"Failed to get stream URL: {e}") from e

    def register_from_env(self):
        host = os.getenv("TAPO_CAMERA_HOST")
        username = os.getenv("TAPO_CAMERA_USERNAME", "admin")
        password = os.getenv("TAPO_CAMERA_PASSWORD")
        if host and password:
            cid = self._register(host, username, password)
            self._cameras[cid]["name"] = os.getenv("TAPO_CAMERA_NAME", f"Tapo {host}")
