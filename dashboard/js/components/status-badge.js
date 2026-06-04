export function statusBadge(alive) {
    return `<span class="badge ${alive ? 'badge-up' : 'badge-down'}">${alive ? 'UP' : 'DOWN'}</span>`;
}
