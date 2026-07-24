const BASE = "/api";
async function request(path, opts) {
    const r = await fetch(`${BASE}${path}`, {
        ...opts,
        headers: { "Content-Type": "application/json", ...opts?.headers },
    });
    if (!r.ok) {
        const body = await r.text();
        throw new Error(`API ${r.status}: ${body || r.statusText}`);
    }
    if (r.headers.get("content-type")?.includes("image")) {
        return r;
    }
    return r.json();
}
// Plugs
export async function getPlugs() {
    return request("/plugs");
}
export async function getPlugStatus(deviceId) {
    return request(`/plugs/${encodeURIComponent(deviceId)}`);
}
export async function togglePlug(deviceId, state) {
    return request(`/plugs/${encodeURIComponent(deviceId)}/toggle`, {
        method: "POST",
        body: JSON.stringify({ state }),
    });
}
export async function getPlugHistory(deviceId, hours = 24) {
    return request(`/plugs/${encodeURIComponent(deviceId)}/history?hours=${hours}`);
}
// Cameras
export async function getCameras() {
    return request("/cameras");
}
export async function getCameraStatus(cameraId) {
    return request(`/cameras/${encodeURIComponent(cameraId)}`);
}
export async function getCameraSnapshotUrl(cameraId) {
    return `${BASE}/cameras/${encodeURIComponent(cameraId)}/snapshot`;
}
export async function ptzMove(cameraId, direction) {
    return request(`/cameras/${encodeURIComponent(cameraId)}/ptz`, {
        method: "POST",
        body: JSON.stringify({ direction }),
    });
}
export async function togglePrivacyMode(cameraId, enabled) {
    return request(`/cameras/${encodeURIComponent(cameraId)}/privacy_mode`, {
        method: "POST",
        body: JSON.stringify({ enabled }),
    });
}
export async function toggleLed(cameraId, enabled) {
    return request(`/cameras/${encodeURIComponent(cameraId)}/led`, {
        method: "POST",
        body: JSON.stringify({ enabled }),
    });
}
// Health
export async function getHealth() {
    return request("/health");
}
