export function changeAttributes(element, attributes) {
    attributes?.forEach((attr) => {
        if (!attr.onlyAttr) {
            element.setAttribute(attr.name, attr.value);
            return;
        }

        attr.value ? element.setAttribute(attr.name, attr.value) : element.removeAttribute(attr.name);
    });
}

export function createElement(tag, content, property) {
    const node = document.createElement(tag);

    if (property?.attributes?.length) {
        property.attributes.forEach((element) => {
            if (element.onlyAttr && !element.value) {
                return;
            }

            node.setAttribute(element.name, element.value);
        });
    }

    if (property?.classes?.length) {
        node.classList.add(...property.classes);
    }

    if (property?.styles) {
        Object.assign(node.style, property.styles);
    }

    if (content) {
        node.textContent = content;
    }

    return node;
}
