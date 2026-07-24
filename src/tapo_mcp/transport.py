import argparse
import asyncio
import logging
import os

import uvicorn
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

ENV_TRANSPORT = "MCP_TRANSPORT"
ENV_HOST = "MCP_HOST"
ENV_PORT = "MCP_PORT"
ENV_PATH = "MCP_PATH"

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 11102
DEFAULT_PATH = "/mcp"


def get_config() -> dict:
    return {
        "transport": os.getenv(ENV_TRANSPORT, "stdio").lower(),
        "host": os.getenv(ENV_HOST, DEFAULT_HOST),
        "port": int(os.getenv(ENV_PORT, str(DEFAULT_PORT))),
        "path": os.getenv(ENV_PATH, DEFAULT_PATH),
    }


def create_parser(server_name: str) -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=f"{server_name} - FastMCP Server")
    g = p.add_mutually_exclusive_group()
    g.add_argument("--stdio", action="store_true", help="STDIO mode (default)")
    g.add_argument("--http", action="store_true", help="HTTP Streamable mode")
    p.add_argument("--host", default=None, help=f"Host (default: {DEFAULT_HOST})")
    p.add_argument("--port", type=int, default=None, help=f"Port (default: {DEFAULT_PORT})")
    p.add_argument("--path", default=None, help=f"Path (default: {DEFAULT_PATH})")
    p.add_argument("--debug", action="store_true", help="Debug logging")
    return p


def resolve_transport(args: argparse.Namespace) -> str:
    if args.http:
        return "http"
    if args.stdio:
        return "stdio"
    env_t = os.getenv(ENV_TRANSPORT, "stdio").lower()
    return env_t if env_t in ("stdio", "http") else "stdio"


def resolve_config(args: argparse.Namespace) -> dict:
    env = get_config()
    return {
        "transport": resolve_transport(args),
        "host": args.host or env["host"],
        "port": args.port or env["port"],
        "path": args.path or env["path"],
    }


def run_server(mcp_app, args: argparse.Namespace | None = None, server_name: str = "tapo-mcp") -> None:
    asyncio.run(run_server_async(mcp_app, args, server_name))


async def run_server_async(mcp_app, args: argparse.Namespace | None = None, server_name: str = "tapo-mcp") -> None:
    if args is None:
        parser = create_parser(server_name)
        args = parser.parse_args()

    config = resolve_config(args)
    transport = config["transport"]

    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("Starting %s transport=%s", server_name, transport.upper())

    try:
        if transport == "stdio":
            await mcp_app.run_stdio_async()
        elif transport == "http":
            host = config["host"]
            port = config["port"]
            app = mcp_app.http_app()
            app.add_middleware(
                CORSMiddleware,
                allow_origins=[
                    f"http://localhost:{port}",
                    "http://127.0.0.1",
                    "http://tauri.localhost",
                    "https://tauri.localhost",
                    "tauri://localhost",
                ],
                allow_origin_regex=(
                    r"https?://(?:[a-zA-Z0-9-]+\.ts\.net"
                    r"|.*?\.tail-[a-f0-9]+\.ts\.net"
                    r"|tauri\.localhost|localhost|127\.0\.0\.1"
                    r"|192\.168\.\d{1,3}\.\d{1,3}"
                    r"|10\.\d{1,3}\.\d{1,3}\.\d{1,3}"
                    r"|100\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?$"
                    r"|^tauri://localhost$"
                ),
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
            )
            uvicorn_config = uvicorn.Config(app, host=host, port=port, log_level="info")
            server = uvicorn.Server(uvicorn_config)
            await server.serve()
    except asyncio.CancelledError:
        logger.info("%s cancelled", server_name)
    except Exception as e:
        logger.error("%s failed: %s", server_name, e, exc_info=True)
        raise
