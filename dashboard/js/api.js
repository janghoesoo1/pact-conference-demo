const SERVICES = {
    session: 'http://localhost:8081',
    attendee: 'http://localhost:8080',
    broker: 'http://localhost:9292'
};

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const start = performance.now();
        const response = await fetch(url, { ...options, signal: controller.signal });
        const elapsed = Math.round(performance.now() - start);
        clearTimeout(id);
        return { response, elapsed };
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

export async function checkHealth(service) {
    try {
        const url = service === 'broker'
            ? SERVICES.broker + '/diagnostic/status/heartbeat'
            : SERVICES[service] + (service === 'session' ? '/sessions' : '/attendees');
        const { response, elapsed } = await fetchWithTimeout(url);
        return { alive: response.ok, status: response.status, elapsed };
    } catch {
        return { alive: false, status: 0, elapsed: 0 };
    }
}

export async function callApi(service, method, path, body = null) {
    const url = SERVICES[service] + path;
    const options = {
        method,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    const { response, elapsed } = await fetchWithTimeout(url, options);
    const data = response.headers.get('content-type')?.includes('json')
        ? await response.json()
        : null;
    return { status: response.status, statusText: response.statusText, data, elapsed };
}

export { SERVICES };
