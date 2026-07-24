import asyncio
import logging
import os
from typing import Annotated

import structlog
from fastmcp import FastMCP
from pydantic import Field

from .core.exceptions import CameraError, PlugError
from .transport import run_server

logger = structlog.get_logger(__name__)

_READ_ONLY = {"readonly": True}
_MUTATING = {}


def create_server() -> FastMCP:
    server = FastMCP(name="tapo-mcp", version="0.1.0")

    # -- Lifespan --
    _plug_mgr = None
    _camera_mgr = None

    @server.lifespan()
    async def lifespan(server: FastMCP):
        logger.info("Starting tapo-mcp")
        nonlocal _plug_mgr, _camera_mgr
        from .devices.camera import CameraManager
        from .devices.plug import PlugManager

        email = os.getenv("TAPO_CLOUD_EMAIL", "")
        password = os.getenv("TAPO_CLOUD_PASSWORD", "")
        if email and password:
            _plug_mgr = PlugManager(email, password)
        _camera_mgr = CameraManager()
        _camera_mgr.register_from_env()
        yield
        logger.info("Shutting down tapo-mcp")

    def _get_plug_mgr():
        nonlocal _plug_mgr
        return _plug_mgr

    def _get_camera_mgr():
        nonlocal _camera_mgr
        return _camera_mgr

    # -- Prompts --
    @server.prompt()
    def tapo_help(topic: str = "") -> str:
        """Get help for Tapo MCP tools."""
        if topic == "plugs":
            return (
                "Tapo smart plugs: use `tapo_plug` with operation=list to discover, "
                "operation=status for current power/energy, operation=toggle to switch, "
                "operation=energy_history for time-series data."
            )
        if topic == "cameras":
            return (
                "Tapo cameras: use `tapo_camera` with operation=list to see registered cams, "
                "operation=snapshot for an image, operation=ptz to pan/tilt, "
                "operation=privacy_mode or led to toggle settings."
            )
        return (
            "Tapo MCP manages TP-Link Tapo cameras and smart plugs. "
            "Use `tapo_plug` for plugs, `tapo_camera` for cameras."
        )

    # -- Resources --
    @server.resource("tapo://info")
    def tapo_info() -> str:
        """Server info and configuration status."""
        has_plugs = _get_plug_mgr() is not None
        cams = _get_camera_mgr().get_cameras() if _get_camera_mgr() else []
        return f"Tapo MCP v0.1.0 | Plugs configured: {has_plugs} | Cameras: {len(cams)}"

    # -- Tools --

    @server.tool(annotations=_READ_ONLY)
    async def tapo_plug(
        operation: Annotated[str, Field(description="list, status, toggle, energy_history")],
        device_id: Annotated[str | None, Field(description="Device ID (required for specific ops)")] = None,
        state: Annotated[bool | None, Field(description="Target power state (toggle only)")] = None,
        hours: Annotated[int, Field(description="History window in hours")] = 24,
    ) -> dict:
        """Control TP-Link Tapo smart plugs.

        ## Return Format
        {"success": bool, "message": str, "data": {...}}
        """
        mgr = _get_plug_mgr()
        if mgr is None:
            return {"success": False, "error": "Tapo cloud credentials not configured"}
        try:
            if operation == "list":
                devices = await mgr.discover()
                return {"success": True, "message": f"Found {len(devices)} plugs", "data": {"devices": devices}}
            if not device_id:
                return {"success": False, "error": "device_id required"}
            if operation == "status":
                status = await mgr.get_status(device_id)
                state_str = "on" if status.get("power_state") else "off"
                return {"success": True, "message": f"Plug {device_id} {state_str}", "data": status}
            if operation == "toggle":
                result = await mgr.toggle(device_id, state)
                return {"success": True, "message": f"Plug {'on' if result['power_state'] else 'off'}", "data": result}
            if operation == "energy_history":
                data = await mgr.get_energy_history(device_id, hours)
                return {"success": True, "message": f"{len(data)} data points", "data": {"points": data}}
            return {"success": False, "error": f"Unknown operation: {operation}"}
        except PlugError as e:
            return {"success": False, "error": str(e), "error_type": e.error_type}

    @server.tool(annotations=_READ_ONLY)
    async def tapo_camera(
        operation: Annotated[str, Field(description="list, status, snapshot, ptz, privacy_mode, led, stream")],
        camera_id: Annotated[str | None, Field(description="Camera ID (required for specific ops)")] = None,
        direction: Annotated[str | None, Field(description="PTZ direction: up/down/left/right")] = None,
        enabled: Annotated[bool | None, Field(description="Toggle state for privacy_mode/led")] = None,
    ) -> dict:
        """Control TP-Link Tapo cameras.

        ## Return Format
        {"success": bool, "message": str, "data": {...}}
        """
        mgr = _get_camera_mgr()
        if mgr is None:
            return {"success": False, "error": "Camera manager not initialized"}
        try:
            if operation == "list":
                cams = mgr.get_cameras()
                return {"success": True, "message": f"{len(cams)} cameras registered", "data": {"cameras": cams}}
            if not camera_id:
                return {"success": False, "error": "camera_id required"}
            if operation == "status":
                status = await mgr.get_status(camera_id)
                return {"success": True, "message": f"Camera {camera_id} status", "data": status}
            if operation == "snapshot":
                data = await mgr.get_snapshot(camera_id)
                if data:
                    import base64

                    b64 = base64.b64encode(data).decode()
                    return {"success": True, "message": "Snapshot captured", "data": {"jpeg_b64": b64}}
                return {"success": False, "error": "No snapshot returned"}
            if operation == "ptz":
                result = await mgr.ptz_move(camera_id, direction or "up")
                return {"success": True, "message": f"Moved {direction}", "data": result}
            if operation == "privacy_mode":
                result = await mgr.set_privacy_mode(camera_id, enabled or False)
                return {"success": True, "message": f"Privacy {'on' if enabled else 'off'}", "data": result}
            if operation == "led":
                result = await mgr.set_led(camera_id, enabled or False)
                return {"success": True, "message": f"LED {'on' if enabled else 'off'}", "data": result}
            if operation == "stream":
                url = await mgr.get_stream_url(camera_id)
                return {"success": True, "message": "Stream URL", "data": {"stream_url": url}}
            return {"success": False, "error": f"Unknown operation: {operation}"}
        except CameraError as e:
            return {"success": False, "error": str(e), "error_type": e.error_type}

    @server.tool(annotations=_MUTATING)
    async def tapo_register_camera(
        host: Annotated[str, Field(description="Camera IP or hostname")],
        username: Annotated[str, Field(description="Camera username")] = "admin",
        password: Annotated[str, Field(description="Camera password")] = "",
        name: Annotated[str | None, Field(description="Friendly name")] = None,
    ) -> dict:
        """Register a Tapo camera for management.

        ## Return Format
        {"success": bool, "camera_id": str}
        """
        mgr = _get_camera_mgr()
        if mgr is None:
            return {"success": False, "error": "Camera manager not initialized"}
        try:
            mgr._register(host, username, password)
            cid = f"tapo_{host.replace('.', '_')}"
            if name:
                mgr._cameras[cid]["name"] = name
            return {"success": True, "camera_id": cid, "message": f"Camera registered as {cid}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    return server


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Tapo MCP Server")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind")
    parser.add_argument("--port", type=int, default=11102, help="Port to bind")
    parser.add_argument("--log-level", default="INFO", help="Logging level")
    args, _ = parser.parse_known_args()

    logging.basicConfig(level=getattr(logging, args.log_level.upper()))
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    server = create_server()
    asyncio.run(run_server(server, server_name="tapo-mcp"))


if __name__ == "__main__":
    main()
