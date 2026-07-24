const BASE = "/api";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts?.headers },
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`API ${r.status}: ${body || r.statusText}`);
  }
  if (r.headers.get("content-type")?.includes("image")) {
    return r as unknown as T;
  }
  return r.json() as Promise<T>;
}

export interface PlugDevice {
  device_id: string;
  device_name?: string;
  device_model?: string;
  status?: string;
}

export interface PlugStatus {
  device_id: string;
  power_w: number;
  voltage_v: number;
  current_a: number;
  daily_energy_kwh?: number;
  monthly_energy_kwh?: number;
  power_state: boolean;
}

export interface HistoryPoint {
  timestamp: string;
  power_w?: number;
}

export interface CameraDevice {
  id: string;
  host: string;
  name: string;
}

// Plugs
export async function getPlugs(): Promise<{ devices: PlugDevice[]; count: number }> {
  return request("/plugs");
}
export async function getPlugStatus(deviceId: string): Promise<{ device: PlugStatus }> {
  return request(`/plugs/${encodeURIComponent(deviceId)}`);
}
export async function togglePlug(deviceId: string, state?: boolean): Promise<{ success: boolean; power_state: boolean }> {
  return request(`/plugs/${encodeURIComponent(deviceId)}/toggle`, {
    method: "POST",
    body: JSON.stringify({ state }),
  });
}
export async function getPlugHistory(deviceId: string, hours = 24): Promise<{ data_points: HistoryPoint[] }> {
  return request(`/plugs/${encodeURIComponent(deviceId)}/history?hours=${hours}`);
}

// Cameras
export async function getCameras(): Promise<{ cameras: CameraDevice[]; count: number }> {
  return request("/cameras");
}
export async function getCameraStatus(cameraId: string): Promise<{ camera: Record<string, unknown> }> {
  return request(`/cameras/${encodeURIComponent(cameraId)}`);
}
export async function getCameraSnapshotUrl(cameraId: string): Promise<string> {
  return `${BASE}/cameras/${encodeURIComponent(cameraId)}/snapshot`;
}
export async function ptzMove(cameraId: string, direction: string): Promise<{ success: boolean }> {
  return request(`/cameras/${encodeURIComponent(cameraId)}/ptz`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });
}
export async function togglePrivacyMode(cameraId: string, enabled: boolean): Promise<{ success: boolean }> {
  return request(`/cameras/${encodeURIComponent(cameraId)}/privacy_mode`, {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
}
export async function toggleLed(cameraId: string, enabled: boolean): Promise<{ success: boolean }> {
  return request(`/cameras/${encodeURIComponent(cameraId)}/led`, {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
}

// Health
export async function getHealth(): Promise<{ success: boolean; status: string }> {
  return request("/health");
}
