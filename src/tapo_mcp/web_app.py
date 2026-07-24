import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from .core.exceptions import CameraError, PlugError

logger = logging.getLogger(__name__)

app = FastAPI(title="Tapo MCP API", version="0.1.0", description="REST API for TP-Link Tapo cameras and plugs")

_origins = ["http://localhost:11103", "http://127.0.0.1:11103"]
_extra = os.environ.get("WEBAPP_ORIGIN", "").strip()
if _extra:
    _origins.append(_extra)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazily initialized managers
_plug_manager = None
_camera_manager = None


def get_plug_manager():
    global _plug_manager
    if _plug_manager is None:
        from .devices.plug import PlugManager

        email = os.getenv("TAPO_CLOUD_EMAIL", "")
        password = os.getenv("TAPO_CLOUD_PASSWORD", "")
        _plug_manager = PlugManager(email, password)
    return _plug_manager


def get_camera_manager():
    global _camera_manager
    if _camera_manager is None:
        from .devices.camera import CameraManager

        _camera_manager = CameraManager()
        _camera_manager.register_from_env()
    return _camera_manager


# -- Health --


@app.get("/api/health")
async def health():
    return {"success": True, "status": "online", "service": "tapo-mcp"}


@app.get("/api/v1/diagnostics")
async def diagnostics():
    from . import __version__

    plug_count = len(get_plug_manager().get_cameras()) if _plug_manager else 0
    cam_count = len(get_camera_manager().get_cameras())
    return {
        "status": "ok",
        "server": "tapo-mcp",
        "version": __version__,
        "device_counts": {"plugs": plug_count, "cameras": cam_count},
    }


# -- Plugs --


class PlugToggleBody(BaseModel):
    state: bool | None = None


@app.get("/api/plugs")
async def list_plugs():
    try:
        devices = await get_plug_manager().discover()
        return {"success": True, "devices": devices, "count": len(devices)}
    except PlugError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/api/plugs/{device_id}")
async def get_plug(device_id: str):
    try:
        status = await get_plug_manager().get_status(device_id)
        return {"success": True, "device": status}
    except PlugError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.post("/api/plugs/{device_id}/toggle")
async def toggle_plug(device_id: str, body: PlugToggleBody = PlugToggleBody()):
    try:
        result = await get_plug_manager().toggle(device_id, body.state)
        return {"success": True, **result}
    except PlugError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/api/plugs/{device_id}/history")
async def plug_history(device_id: str, hours: int = 24):
    try:
        data = await get_plug_manager().get_energy_history(device_id, hours)
        return {"success": True, "device_id": device_id, "hours": hours, "data_points": data}
    except PlugError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


# -- Cameras --


@app.get("/api/cameras")
async def list_cameras():
    cams = get_camera_manager().get_cameras()
    return {"success": True, "cameras": cams, "count": len(cams)}


@app.get("/api/cameras/{camera_id}")
async def get_camera(camera_id: str):
    try:
        status = await get_camera_manager().get_status(camera_id)
        return {"success": True, "camera": status}
    except CameraError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/api/cameras/{camera_id}/snapshot")
async def camera_snapshot(camera_id: str):
    try:
        data = await get_camera_manager().get_snapshot(camera_id)
        if data is None:
            raise HTTPException(status_code=502, detail="No snapshot returned")
        return Response(content=data, media_type="image/jpeg")
    except CameraError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.post("/api/cameras/{camera_id}/ptz")
async def camera_ptz(camera_id: str, direction: str = "up"):
    try:
        result = await get_camera_manager().ptz_move(camera_id, direction)
        return {"success": True, **result}
    except CameraError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.post("/api/cameras/{camera_id}/privacy_mode")
async def camera_privacy(camera_id: str, enabled: bool = True):
    try:
        result = await get_camera_manager().set_privacy_mode(camera_id, enabled)
        return {"success": True, **result}
    except CameraError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.post("/api/cameras/{camera_id}/led")
async def camera_led(camera_id: str, enabled: bool = True):
    try:
        result = await get_camera_manager().set_led(camera_id, enabled)
        return {"success": True, **result}
    except CameraError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/api/cameras/{camera_id}/stream")
async def camera_stream(camera_id: str):
    try:
        url = await get_camera_manager().get_stream_url(camera_id)
        return {"success": True, "stream_url": url}
    except CameraError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
