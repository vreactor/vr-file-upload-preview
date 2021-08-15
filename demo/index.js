import './styles/index.less';

import '../src/index.js';
import '../src/styles/index.less';

const URLS_IMAGES = ['https://i.ibb.co/QJwDg3f/i-love-javascript.png', 'https://i.ibb.co/5RzgdHr/cat.gif'];

const previewHtml = document.querySelector('[data-language="html"]');
const previewJs = document.querySelector('[data-language="javascript"]');

const btnUploader = document.querySelector('.button-uploader');
const dropUploader = document.querySelector('.dropzone-uploader');

const btnUploaderMultiple = btnUploader.getAttribute('multiple');
const btnUploaderAccept = btnUploader.getAttribute('accept');
const btnUploaderMaxFiles = btnUploader.getAttribute('max-files');
const btnUploaderMaxSize = btnUploader.getAttribute('max-size');

const multiple = document.querySelector('#multiple');
const accept = document.querySelector('#accept');
const maxFiles = document.querySelector('#max-files');
const maxSize = document.querySelector('#max-size');

previewHtml.textContent = require('!raw-loader!./examples/vr-file-uploader.html').default;
previewJs.textContent = require('!raw-loader!./examples/vr-file-uploader.js').default;

multiple.checked = btnUploaderMultiple === '' || btnUploaderMultiple === 'true';
accept.value = btnUploaderAccept;
maxFiles.value = btnUploaderMaxFiles;
maxSize.value = btnUploaderMaxSize;

multiple.addEventListener('change', e => {
    btnUploader.setAttribute('multiple', e.target.checked);
    dropUploader.setAttribute('multiple', e.target.checked);
});

accept.addEventListener('change', e => {
    btnUploader.setAttribute('accept', e.target.value);
    dropUploader.setAttribute('accept', e.target.value);
});

maxFiles.addEventListener('change', e => {
    btnUploader.setAttribute('max-files', e.target.value);
    dropUploader.setAttribute('max-files', e.target.value);
});

maxSize.addEventListener('change', e => {
    btnUploader.setAttribute('max-size', e.target.value);
    dropUploader.setAttribute('max-size', e.target.value);
});

[btnUploader, dropUploader].forEach(element => {
    element.addEventListener('change', (e) => {
        console.log(element.className, e.detail.files);
        // console.log(btnUploader.files);
    });
});

[btnUploader, dropUploader].forEach(element => {
    element.addEventListener('error', (e) => {
        const {file, type} = e.detail;

        console.log(element.className, {file, type});
    });
});

getImages(URLS_IMAGES)
    .then(images => btnUploader.upload(images));


function getImages(urls) {
    const blobs = urls.map(url => fetch(url).then(res => res.blob()));

    return Promise.all(blobs);
}
