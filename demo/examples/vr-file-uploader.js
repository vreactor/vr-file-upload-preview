import 'vr-file-upload-preview';
import 'vr-file-upload-preview/vr-file-upload-preview.min.css';

const URLS_IMAGES = [
    'https://i.ibb.co/QJwDg3f/i-love-javascript.png',
    'https://i.ibb.co/5RzgdHr/cat.gif'
];
const uploader = document.querySelector('vr-file-upload-preview');

getImages(URLS_IMAGES).then(images => uploader.upload(images));

uploader.addEventListener('change', (e) => {
    console.log(e.detail.files);
    // console.log(uploader.files);
});

uploader.addEventListener('error', (e) => {
    const {file, type} = e.detail;

    console.log({file, type});
});

function getImages(urls) {
    const blobs = urls.map(url => fetch(url).then(res => res.blob()));

    return Promise.all(blobs);
}
