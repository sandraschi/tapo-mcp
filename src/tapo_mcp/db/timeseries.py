import logging
import sqlite3
from datetime import UTC, datetime, timedelta
from pathlib import Path

logger = logging.getLogger(__name__)


class TimeSeriesDB:
    def __init__(self, db_path: str | Path | None = None):
        if db_path is None:
            db_path = Path(__file__).parent.parent.parent.parent / "data" / "timeseries.db"
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS energy_timeseries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    device_id TEXT NOT NULL,
                    timestamp INTEGER NOT NULL,
                    power_w REAL,
                    voltage_v REAL,
                    current_a REAL,
                    daily_energy_kwh REAL,
                    monthly_energy_kwh REAL,
                    power_state INTEGER,
                    UNIQUE(device_id, timestamp)
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_energy_device_ts
                ON energy_timeseries(device_id, timestamp)
            """)

    def store_reading(
        self,
        device_id: str,
        power_w: float,
        voltage_v: float,
        current_a: float,
        daily_kwh: float | None = None,
        monthly_kwh: float | None = None,
        power_state: bool | None = None,
    ) -> None:
        ts = int(datetime.now(UTC).timestamp())
        sql = (
            "INSERT OR REPLACE INTO energy_timeseries "
            "(device_id, timestamp, power_w, voltage_v, current_a, "
            "daily_energy_kwh, monthly_energy_kwh, power_state) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(sql, (device_id, ts, power_w, voltage_v, current_a, daily_kwh, monthly_kwh, power_state))

    def get_history(self, device_id: str, hours: int = 24) -> list[dict]:
        cutoff = int((datetime.now(UTC) - timedelta(hours=hours)).timestamp())
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                """SELECT timestamp, power_w, voltage_v, current_a, daily_energy_kwh, power_state
                   FROM energy_timeseries
                   WHERE device_id = ? AND timestamp >= ?
                   ORDER BY timestamp ASC""",
                (device_id, cutoff),
            ).fetchall()
        return [dict(r) for r in rows]

    def get_latest(self, device_id: str) -> dict | None:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                """SELECT timestamp, power_w, voltage_v, current_a, daily_energy_kwh, power_state
                   FROM energy_timeseries
                   WHERE device_id = ?
                   ORDER BY timestamp DESC LIMIT 1""",
                (device_id,),
            ).fetchone()
        return dict(row) if row else None

    def get_all_devices(self) -> list[str]:
        with sqlite3.connect(self.db_path) as conn:
            rows = conn.execute("SELECT DISTINCT device_id FROM energy_timeseries").fetchall()
        return [r[0] for r in rows]
