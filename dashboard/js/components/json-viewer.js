/**
 * JSON Viewer - 구문 하이라이팅 + 접기/펼치기
 * 재귀적 DOM 생성, 2단계 이상 기본 접기
 */

export function createJsonViewer(data, depth = 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'json-viewer';
    const node = buildNode(data, depth, false);
    wrapper.appendChild(node);
    return wrapper;
}

function buildNode(value, depth, isLast) {
    const type = getType(value);

    if (type === 'object' || type === 'array') {
        return buildCollapsible(value, type, depth, isLast);
    }

    const span = document.createElement('span');
    span.appendChild(buildPrimitive(value, type));
    if (!isLast) {
        const comma = document.createElement('span');
        comma.className = 'jv-punctuation';
        comma.textContent = ',';
        span.appendChild(comma);
    }
    return span;
}

function buildCollapsible(value, type, depth, isLast) {
    const isArray = type === 'array';
    const entries = isArray ? value : Object.entries(value);
    const isEmpty = isArray ? value.length === 0 : Object.keys(value).length === 0;

    if (isEmpty) {
        const span = document.createElement('span');
        span.className = 'jv-punctuation';
        span.textContent = isArray ? '[]' : '{}';
        if (!isLast) {
            const comma = document.createElement('span');
            comma.className = 'jv-punctuation';
            comma.textContent = ',';
            span.appendChild(comma);
        }
        return span;
    }

    const container = document.createElement('span');
    const collapsed = depth >= 2;

    // Toggle button
    const toggle = document.createElement('span');
    toggle.className = 'jv-toggle' + (collapsed ? ' collapsed' : '');
    toggle.textContent = '▼';

    // Opening bracket
    const open = document.createElement('span');
    open.className = 'jv-punctuation jv-collapsible';
    open.appendChild(toggle);
    const openBracket = document.createElement('span');
    openBracket.className = 'jv-punctuation';
    openBracket.textContent = isArray ? ' [' : ' {';
    open.appendChild(openBracket);

    // Children container
    const children = document.createElement('div');
    children.className = 'jv-children' + (collapsed ? ' hidden' : '');

    // Ellipsis (shown when collapsed and not empty)
    const ellipsis = document.createElement('span');
    ellipsis.className = 'jv-ellipsis';
    ellipsis.textContent = isArray
        ? ` [${value.length} items]`
        : ` {${Object.keys(value).length} keys}`;
    if (!collapsed) ellipsis.style.display = 'none';

    const items = isArray ? value : Object.entries(value);
    items.forEach((item, i) => {
        const line = document.createElement('div');
        const isLastItem = i === items.length - 1;

        if (!isArray) {
            const [k, v] = item;
            const keySpan = document.createElement('span');
            keySpan.className = 'jv-key';
            keySpan.textContent = `"${k}"`;
            const colon = document.createElement('span');
            colon.className = 'jv-punctuation';
            colon.textContent = ': ';
            line.appendChild(keySpan);
            line.appendChild(colon);
            line.appendChild(buildNode(v, depth + 1, isLastItem));
        } else {
            line.appendChild(buildNode(item, depth + 1, isLastItem));
        }

        children.appendChild(line);
    });

    // Closing bracket
    const close = document.createElement('span');
    close.className = 'jv-punctuation';
    close.textContent = isArray ? ']' : '}';
    if (!isLast) {
        const comma = document.createElement('span');
        comma.className = 'jv-punctuation';
        comma.textContent = ',';
        close.appendChild(comma);
    }

    // Toggle click handler
    open.addEventListener('click', () => {
        const isHidden = children.classList.contains('hidden');
        children.classList.toggle('hidden', !isHidden);
        ellipsis.style.display = isHidden ? 'none' : '';
        toggle.classList.toggle('collapsed', !isHidden);
    });

    container.appendChild(open);
    container.appendChild(ellipsis);
    container.appendChild(children);
    container.appendChild(close);

    return container;
}

function buildPrimitive(value, type) {
    const span = document.createElement('span');
    span.className = `jv-${type}`;

    if (type === 'string') {
        span.textContent = `"${escapeString(value)}"`;
    } else if (type === 'null') {
        span.textContent = 'null';
    } else {
        span.textContent = String(value);
    }

    return span;
}

function getType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

function escapeString(str) {
    return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}
