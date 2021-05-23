import './styles/index.less';
import {
    dispatchEvent,
    getSize,
    changeAttributes,
    createElement,
} from './utils';

export const VR_FILE_ERROR_TYPE = {
    FORMAT: 'FORMAT',
    MAX_FILES: 'MAX_FILES',
    MAX_SIZE: 'MAX_SIZE',
};

export const VR_FILE_CLASS = {
    PREVIEW: 'vr-preview',
    IMAGE: 'vr-preview-image',
    REMOVE: 'vr-preview-remove',
    SOURCE: 'vr-preview-source',
    INFO: 'vr-preview-info',
};

customElements.define(
    'vr-file-upload-preview',
    class extends HTMLElement {
        static get observedAttributes() {
            return ['preview', 'multiple', 'accept', 'max-files', 'max-size'];
        }

        get preview() {
            const value = this.getAttribute('preview');

            return value && document.querySelector(value);
        }

        get accept() {
            return this.getAttribute('accept');
        }

        get multiple() {
            const value = this.getAttribute('multiple');

            return value === '' || value === 'true';
        }

        get maxFiles() {
            const value = parseInt(this.getAttribute('max-files'));

            return !isNaN(value) ? value : null;
        }

        get maxSize() {
            const value = parseInt(this.getAttribute('max-size'));

            return !isNaN(value) ? value : null;
        }

        constructor() {
            super();

            this.files = [];
            this.rendered = false;
            this.container = null;
            this.input = null;
            this.open = null;
            this.clickHandler = (e) => this.input.click();
            this.changeHandler = (e) => this.onChange(e);
            this.removeHandler = (e) => this.onRemove(e);
        }

        render() {
            const shadowRoot = this.attachShadow({ mode: 'open' });

            this.container = this.preview;
            this.input = createElement('input', null, {
                attributes: [
                    { name: 'multiple', value: this.multiple, onlyAttr: true },
                    { name: 'accept', value: this.accept },
                    { name: 'max-files', value: this.maxFiles },
                    { name: 'max-size', value: this.maxSize },
                    { name: 'type', value: 'file' },
                ],
                styles: { display: 'none' },
            });
            this.open = createElement('slot', null);
            shadowRoot.appendChild(this.input);
            this.input.insertAdjacentElement('afterend', this.open);

            if (!this.container) {
                this.container = createElement('div', null, {
                    classes: [VR_FILE_CLASS.PREVIEW],
                });
                this.insertAdjacentElement('afterend', this.container);
            }

            this.open.addEventListener('click', this.clickHandler);
            this.input.addEventListener('change', this.changeHandler);
            this.container.addEventListener('click', this.removeHandler);
        }

        disconnectedCallback() {
            this.open.removeEventListener('click', this.clickHandler);
            this.input.removeEventListener('change', this.changeHandler);
            this.container.removeEventListener('click', this.removeHandler);
        }

        connectedCallback() {
            this.render();
            this.rendered = true;
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (!this.rendered) {
                return;
            }

            switch (name) {
                case 'multiple': {
                    changeAttributes(this.input, [
                        {
                            name,
                            value: newValue === '' || newValue === 'true',
                            onlyAttr: true,
                        },
                    ]);
                    return;
                }
                case 'accept': {
                    changeAttributes(this.input, [{ name, value: newValue }]);
                    return;
                }
                case 'max-files': {
                    changeAttributes(this.input, [{ name, value: newValue }]);
                    return;
                }
                case 'max-size': {
                    changeAttributes(this.input, [{ name, value: newValue }]);
                    return;
                }
                case 'preview': {
                    this.container.remove();
                    this.container = this.preview;

                    if (!this.container) {
                        this.container = createElement('div', null, {
                            classes: [VR_FILE_CLASS.PREVIEW],
                        });
                        this.insertAdjacentElement('afterend', this.container);
                    }

                    this.container.addEventListener('click', this.removeHandler);
                    return;
                }
                default:
                    return;
            }
        }

        onRemove(event) {
            if (!event.target.dataset.name) {
                return;
            }

            const { name } = event.target.dataset;
            const block = this.container
                .querySelector(`[data-name="${name}"]`)
                .closest(`.${VR_FILE_CLASS.IMAGE}`);

            this.files = this.files.filter((file) => file.name !== name);
            dispatchEvent('change', this, { files: this.files });
            block.remove();

            if (!this.files.length) {
                this.input.value = '';
            }
        }

        onChange(event) {
            const files = Array.from(event.target.files);
            const cache = [];

            if (!files.length) {
                return;
            }

            this.input.value = '';
            files.forEach((file, index) => {
                const errorType = this.handleError(file, index);

                if (errorType) {
                    return dispatchEvent('error', this, {
                        file,
                        type: errorType,
                    });
                }

                if (this.files.some(value => value.name === file.name && value.size === file.size)) {
                    return;
                }

                this.buildTemplate(file);
                cache.push(file);
            });

            if (cache.length) {
                this.files = [...this.files, ...cache];
                dispatchEvent('change', this, { files: this.files });
            }
        }

        buildTemplate(file) {
            if (!file.type.match('image')) {
                this.container.insertAdjacentHTML(
                    'afterbegin',
                    this.getTemplatePreviewImage(file)
                );

                return;
            }

            const reader = new FileReader();

            reader.onload = ({target}) => this.container.insertAdjacentHTML(
                'afterbegin',
                this.getTemplatePreviewImage(file, target.result)
            );
            reader.readAsDataURL(file);
        }

        handleError(file, count) {
            const accept = this.accept?.replace(/ /g,'');

            if (accept && !accept.split(',').some((type) => file.type.match(type))) {
                return VR_FILE_ERROR_TYPE.FORMAT;
            }

            if (typeof this.maxFiles === 'number' && (count >= this.maxFiles || this.files.length >= this.maxFiles)) {
                return VR_FILE_ERROR_TYPE.MAX_FILES;
            }

            if (typeof this.maxSize === 'number' && file.size > this.maxSize) {
                return VR_FILE_ERROR_TYPE.MAX_SIZE;
            }

            return;
        }

        getTemplatePreviewImage(file, source) {
            return `
                <div class="${VR_FILE_CLASS.IMAGE}">
                    <div
                        class="${VR_FILE_CLASS.REMOVE}"
                        data-name="${file.name}"
                    >
                        &times;
                    </div>
                    <div
                        class="${VR_FILE_CLASS.SOURCE}"
                        style="${source ? `background-image: url(${source})` : ''}"
                    >
                        ${source ? '' : file.type}
                    </div>
                    <div class="${VR_FILE_CLASS.INFO}">
                        <span>${this.getShortName(file.name)}</span>
                        ${getSize(file.size)}
                    </div>
                </div>
            `;
        }

        getShortName(value, max = 12) {
            const [name, format] = value.split('.');

            return `${name.slice(0, max)}.${format}`
        }
    }
);
