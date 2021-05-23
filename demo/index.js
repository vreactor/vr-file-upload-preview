import "./styles/index.less";

import "../src/index.js";
import "../src/styles/index.less";

const previewHtml = document.querySelector('[data-language="html"]');
const previewJs = document.querySelector('[data-language="javascript"]');

const uploader = document.querySelector('vr-file-upload-preview');

const multiple = document.querySelector('#multiple');
const accept = document.querySelector('#accept');
const maxFiles = document.querySelector('#max-files');
const maxSize = document.querySelector('#max-size');

const uploaderMultiple = uploader.getAttribute('multiple');
const uploaderAccept = uploader.getAttribute('accept');
const uploaderMaxFiles = uploader.getAttribute('max-files');
const uploaderMaxSize = uploader.getAttribute('max-size');

previewHtml.textContent = require('!raw-loader!./examples/vr-file-uploader.html').default;
previewJs.textContent = require('!raw-loader!./examples/vr-file-uploader.js').default;

multiple.checked = uploaderMultiple === '' || uploaderMultiple === 'true';
accept.value = uploaderAccept;
maxFiles.value = uploaderMaxFiles;
maxSize.value = uploaderMaxSize;

multiple.addEventListener('change', e => uploader.setAttribute('multiple', e.target.checked));
accept.addEventListener('change', e => uploader.setAttribute('accept', e.target.value));
maxFiles.addEventListener('change', e => uploader.setAttribute('max-files', e.target.value));
maxSize.addEventListener('change', e => uploader.setAttribute('max-size', e.target.value));

uploader.addEventListener('change', (e) => {
    console.log(e.detail.files);
    // console.log(uploader.files);
});

uploader.addEventListener('error', (e) => {
    const {file, type} = e.detail;

    console.log({file, type});
});

