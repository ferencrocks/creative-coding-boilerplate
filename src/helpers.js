export function getViewportSize() {
    const viewport = document.getElementById('viewport');
    return {
        width: viewport.clientWidth,
        height: viewport.clientHeight,
    };
}