import './styles/index.less';

import {
    changeAttributes,
    createElement,
    dispatchEvent,
    getSize,
    mimeConvert,
    uuidv4
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
    HIGHLIGHT: 'vr-highlight-dropzone'
};

customElements.define(
    'vr-file-upload-preview',
    class extends HTMLElement {
        /** The current selected files. */
        files = [];
        /** Sign that the component is rendered. */
        rendered;
        /** Reference to input element for file selection. */
        inputRef;
        /** Reference to button element. */
        uploadRef;
        /** Reference to container for displaying file previews. */
        containerRef;

        static get observedAttributes() {
            return ['preview', 'multiple', 'accept', 'max-files', 'max-size'];
        }

        /**
         * A selector or group of selectors pointing to the container for previewing files.
         * @returns {string}
         */
        get preview() {
            return this.getAttribute('preview');
        }

        /**
         * Acceptable file types.
         * @returns {string}
         */
        get accept() {
            return this.getAttribute('accept');
        }

        /**
         * Multiple selection of files.
         * @returns {boolean}
         */
        get multiple() {
            const value = this.getAttribute('multiple');

            return value === '' || value === 'true';
        }

        /**
         * Maximum number of files.
         * @returns {number | null}
         */
        get maxFiles() {
            const value = parseInt(this.getAttribute('max-files'));

            return !isNaN(value) ? value : null;
        }

        /** Maximum file size. */
        get maxSize() {
            const value = parseInt(this.getAttribute('max-size'));

            return !isNaN(value) ? value : null;
        }

        /**
         * File drag and drop.
         * @returns {boolean}
         */
        get dropzone() {
            const value = this.getAttribute('dropzone');

            return value === '' || value === 'true';
        }

        constructor() {
            super();
        }

        onSelect = (e) => this.inputRef.click();

        onChange = (e) => this.changeHandler(e);

        onRemove = (e) => this.removeHandler(e);

        onDrop = (e) => this.filesHandler(e.dataTransfer.files);

        onHighlight = (e) => this.uploadRef.classList.add(VR_FILE_CLASS.HIGHLIGHT);

        onUnhighlight = (e) => this.uploadRef.classList.remove(VR_FILE_CLASS.HIGHLIGHT);

        connectedCallback() {
            this.render();
            this.rendered = true;
        }

        disconnectedCallback() {
            this.defaultEventListners(false);
            this.dragOnDropEventListners(false);
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (!this.rendered) {
                return;
            }

            switch (name) {
                case 'accept':
                case 'max-files':
                case 'max-size': {
                    changeAttributes(this.inputRef, [{ name, value: newValue }]);
                    return;
                }
                case 'multiple': {
                    changeAttributes(this.inputRef, [
                        {
                            name,
                            value: newValue === '' || newValue === 'true',
                            onlyAttr: true,
                        },
                    ]);
                    return;
                }
                case 'preview': {
                    this.buildPreviewPanel();
                    this.containerRef.addEventListener('click', this.onRemove);
                    return;
                }
                default:
                    return;
            }
        }

        render() {
            const shadowRoot = this.attachShadow({ mode: 'open' });
            const slot = createElement('slot');

            this.inputRef = createElement('input', null, {
                attributes: [
                    { name: 'multiple', value: this.multiple, onlyAttr: true },
                    { name: 'dropzone', value: this.dropzone, onlyAttr: true },
                    { name: 'accept', value: this.accept },
                    { name: 'max-files', value: this.maxFiles },
                    { name: 'max-size', value: this.maxSize },
                    { name: 'type', value: 'file' },
                ],
                styles: { display: 'none' },
            });
            shadowRoot.appendChild(this.inputRef);
            this.inputRef.insertAdjacentElement('afterend', slot);
            this.uploadRef = slot.assignedNodes()?.find(node => node.nodeType === 1);

            this.buildPreviewPanel();
            this.setEventListners();
        }

        removeHandler(event) {
            if (!event.target.dataset.name) {
                return;
            }

            const { name } = event.target.dataset;
            const block = this.containerRef
                .querySelector(`[data-name="${name}"]`)
                .closest(`.${VR_FILE_CLASS.IMAGE}`);

            this.files = this.files.filter((file) => file.name !== name);
            dispatchEvent('change', this, { files: this.files });
            block.remove();

            if (!this.files.length) {
                this.inputRef.value = '';
            }
        }

        changeHandler(event) {
            const files = Array.from(event.target.files);

            this.filesHandler(files)
        }

        errorHandler(file, count) {
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

        filesHandler(files) {
            const cache = [];

            if (!files.length) {
                return;
            }

            this.inputRef.value = '';

            Array.from(files).forEach((file, index) => {
                const errorType = this.errorHandler(file, index);

                if (errorType) {
                    return dispatchEvent('error', this, {
                        file,
                        type: errorType,
                    });
                }

                if (!file.name) {
                    const name = uuidv4();
                    const format = mimeConvert(file.type);

                    file.name = name + format;
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

        /**
         * Upload file.
         * @param {Blob | Array<Blob>} value - File or array of files.
         * @returns {void}
         */
        upload(value) {
            if (Array.isArray(value) && !value.length || !Array.isArray(value) && !value) {
                return;
            }

            const array = Array.isArray(value) ? value : [value];
            const files = array.filter(file => file instanceof Blob);

            this.filesHandler(files);
        }

        /**
         * Remove file by index.
         * @param {number} index - Index from `files`.
         * @returns {void}
         */
        remove(index) {
            if(index + 1 > this.files.length) {
                return
            }

            this.files.splice(index, 1);
            dispatchEvent('change', this, { files: this.files });

            for (var i = 0; i < this.containerRef.children.length; i++) {
                if (i == index) {
                    this.containerRef.children[i].parentNode.removeChild(this.containerRef.children[i]);
                    break;
                }
            }

            if (!this.files.length) {
                this.inputRef.value = '';
            }
        }

        /**
         * Clear all files.
         * @returns {void}
         */
        clear() {
            while (this.containerRef.firstChild) {
                this.containerRef.removeChild(this.containerRef.lastChild);
            }

            this.inputRef.value = '';
            this.files = [];

            dispatchEvent('change', this, { files: this.files });
        }

        buildPreviewPanel() {
            this.containerRef?.remove();
            this.containerRef = document.querySelector(this.preview);

            if (!this.containerRef) {
                this.containerRef = createElement('div', null, {
                    classes: [VR_FILE_CLASS.PREVIEW],
                });
                this.insertAdjacentElement('afterend', this.containerRef);
            }
        }

        buildTemplate(file) {
            if (!file.type.match('image')) {
                this.containerRef.insertAdjacentHTML(
                    'beforeend',
                    this.getTemplatePreviewImage(file)
                );

                return;
            }

            const reader = new FileReader();

            reader.onload = ({target}) => this.containerRef.insertAdjacentHTML(
                'beforeend',
                this.getTemplatePreviewImage(file, target.result)
            );
            reader.readAsDataURL(file);
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

        setEventListners() {
            this.defaultEventListners();

            if (this.dropzone) {
                this.dragOnDropEventListners();
            }
        }

        defaultEventListners(set = true) {
            const action = set ? 'addEventListener' : 'removeEventListener';

            this.uploadRef[action]('click', this.onSelect);
            this.inputRef[action]('change', this.onChange);
            this.containerRef[action]('click', this.onRemove);
        }

        dragOnDropEventListners(set = true) {
            const action = set ? 'addEventListener' : 'removeEventListener';

            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName =>
                this.uploadRef[action](eventName, this.preventDefaults)
            );

            // Highlight drop area when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => this.uploadRef[action](eventName, this.onHighlight));
            ['dragleave', 'drop'].forEach(eventName => this.uploadRef[action](eventName, this.onUnhighlight));

            // Handle dropped files
            this.uploadRef[action]('drop', this.onDrop)
        }

        getShortName(value, max = 12) {
            const [name, format] = value.split('.');

            return `${name.slice(0, max)}.${format}`
        }

        preventDefaults(e) {
            e.preventDefault()
            e.stopPropagation()
        }
    }
);
