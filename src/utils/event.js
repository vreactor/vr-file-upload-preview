export function dispatchEvent(event, element, detail) {
    element.dispatchEvent(
        new CustomEvent(event, {
            bubbles: false,
            composed: true,
            detail,
        })
    );
}
