import 'vr-file-upload-preview';
import 'vr-file-upload-preview/vr-file-upload-preview.min.css';

const uploader = document.querySelector('vr-file-upload-preview');

uploader.addEventListener('change', (e) => {
    console.log(e.detail.files);
    // console.log(uploader.files);
});

uploader.addEventListener('error', (e) => {
    const {file, type} = e.detail;

    console.log({file, type});
});
