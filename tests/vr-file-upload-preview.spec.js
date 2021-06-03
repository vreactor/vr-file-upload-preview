import '../src/index.js';

import userEvent from '@testing-library/user-event';
import {fireEvent} from '@testing-library/dom';

const insertComponent = () => document.body.innerHTML = `
    <vr-file-upload-preview multiple>
        <button>Upload</button>
    </vr-file-upload-preview>
`;

describe('Module Actions', () => {
    it('The component should be rendered', async () => {
        insertComponent();

        const uploader = document.querySelector('vr-file-upload-preview');

        expect(uploader.rendered).toBeTruthy();
    });

    it('Number of files should be limited', async () => {
        insertComponent();

        const uploader = document.querySelector('vr-file-upload-preview');

        uploader.setAttribute('max-files', '2');

        userEvent.upload(uploader.inputRef, new File(['dog'], 'dog.png', { type: 'image/png' }))
        expect(uploader.files).toHaveLength(1);

        userEvent.upload(uploader.inputRef, [
            new File(['cat'], 'cat.png', { type: 'image/png' }),
            new File(['dog'], 'dog.png', { type: 'image/png' }),
            new File(['bird'], 'bird.png', { type: 'image/png' }),
        ]);
        expect(uploader.files).toHaveLength(2);
    });

    it('File size should be limited', async () => {
        insertComponent();

        const uploader = document.querySelector('vr-file-upload-preview');

        uploader.setAttribute('max-size', '2');

        userEvent.upload(uploader.inputRef, [
            new File(['hello'], 'hello.png', { type: 'image/png' }),
            new File(['my'], 'my.png', { type: 'image/png' }),
            new File(['world'], 'world.png', { type: 'image/png' }),
        ]);
        expect(uploader.files).toHaveLength(1);
        expect(uploader.files[0].name).toBe('my.png');
    });

    it('File size should be limited', async () => {
        insertComponent();

        const uploader = document.querySelector('vr-file-upload-preview');

        uploader.setAttribute('max-size', '2');

        userEvent.upload(uploader.inputRef, [
            new File(['hello'], 'hello.png', { type: 'image/png' }),
            new File(['my'], 'my.png', { type: 'image/png' }),
            new File(['world'], 'world.png', { type: 'image/png' }),
        ]);
        expect(uploader.files).toHaveLength(1);
        expect(uploader.files[0].name).toBe('my.png');
    });

    it('The file type should be limited', async () => {
        insertComponent();

        const uploader = document.querySelector('vr-file-upload-preview');

        uploader.setAttribute('accept', '.png, .gif');

        userEvent.upload(uploader.inputRef, [
            new File(['cat'], 'cat.png', { type: 'image/png' }),
            new File(['dog'], 'dog.jpg', { type: 'image/jpg' }),
            new File(['bird'], 'bird.gif', { type: 'image/png' }),
        ]);
        expect(uploader.files).toHaveLength(2);
        expect(uploader.files).toEqual([
            new File(['cat'], 'cat.png', { type: 'image/png' }),
            new File(['bird'], 'bird.gif', { type: 'image/png' }),
        ]);
    });

    it('All files in preview should be displayed', async () => {
        insertComponent();

        const uploader = document.querySelector('vr-file-upload-preview');
        const preview = document.createElement('div');

        preview.classList.add('custom-preview');
        document.body.insertAdjacentElement('beforeend', preview);
        uploader.setAttribute('preview', '.custom-preview');

        userEvent.upload(uploader.inputRef, [
            new File(['cat'], 'cat.png', { type: 'image/png' }),
            new File(['dog'], 'dog.jpg', { type: 'image/jpg' }),
        ]);
        await new Promise((r) => setTimeout(r, 100));
        expect(uploader.files).toHaveLength(2);
        expect(preview.childElementCount).toEqual(2);
    });

    it('The "change" event should be triggered every time a file is selected', async () => {
        insertComponent();

        const uploader = document.querySelector('vr-file-upload-preview');
        const spy = jest.spyOn(uploader, 'changeHandler');
        const file = new File(['cat'], 'cat.png', { type: 'image/png' });

        uploader.addEventListener('change', (e) => {
            const {files} = e.detail;

            expect(files).toStrictEqual([file]);
        });

        userEvent.upload(uploader.inputRef, file);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(uploader.files).toHaveLength(1);
    });

    it('The "error" event should be triggered every time an invalid file is selected', async () => {
        insertComponent();

        const uploader = document.querySelector('vr-file-upload-preview');
        const spy = jest.spyOn(uploader, 'changeHandler');

        uploader.setAttribute('accept', '.gif');

        uploader.addEventListener('error', (e) => {
            const {type} = e.detail;

            expect(type).toBe('FORMAT');
        });

        userEvent.upload(uploader.inputRef, new File(['avatar'], 'avatar.png', { type: 'image/png' }));
        expect(spy).toHaveBeenCalledTimes(1);
        expect(uploader.files).toHaveLength(0);
    });
});
