'use babel';

import GitLink from '../lib/git-link';

// Use the command `window:run-package-specs` (ctrl+shift+y) to run specs.
describe('GitLink', () => {

    describe('Check if git is installed', () => {
        // TODO
    })

    describe('Parsing functions - getRepoFromOrigin', () => {
        fit("has to support the GIT url as origin", () => {
            // Expectations
            const origin = 'git@github.com:keevan/git-link.git'
            expect('https://github.com/keevan/git-link').toEqual(GitLink.getRepoFromOrigin(origin))
        })
        fit("has to support the HTTPS url has origin", () => {
            // Expectations
            const origin = 'https://github.com/keevan/git-link.git'
            expect('https://github.com/keevan/git-link').toEqual(GitLink.getRepoFromOrigin(origin))
        })
    })

    describe('Parsing functions - getCommitHashFromLog', () => {
        fit("has to return in short form", () => {
            // Expectations
            const log = '014ed5d66c0e5afc7badd8fde666e399e43aa882 (HEAD -> main, origin/main) Add CI for github workflows'
            expect('014ed5d').toEqual(GitLink.getCommitHashFromLog(log))
        })
    })

    describe('Parsing functions - getRelativePathFromForwardFilePath', () => {
        fit('has to stay the same', () => {
            // Expectations
            const path = '/lib/git-link.js'
            expect('/lib/git-link.js').toEqual(GitLink.getRelativePathFromForwardFilePath(path))
        })
        fit('has to be properly encoded', () => {
            // Expectations
            const path = '/[folder]-[id]/file#example'
            expect('/%5Bfolder%5D-%5Bid%5D/file%23example').toEqual(GitLink.getRelativePathFromForwardFilePath(path))
        })
        fit('has to add plain=1 as a parameter', () => {
            // Expectations
            const path = '/README.md'
            expect('/README.md?plain=1').toEqual(GitLink.getRelativePathFromForwardFilePath(path))
        })
    })

    describe('Editor state', () => {

        beforeEach(async () => {
            await atom.workspace.open('sample.js');

            runs(() => {
                editor = atom.workspace.getActiveTextEditor();
                editorView = atom.views.getView(editor);

                return activationPromise = atom.packages.activatePackage('git-link');
            });
        });

        // getCurrentLineNumber
        fit('has to be on the correct line', () => {
            const editor = atom.workspace.getActiveTextEditor()
            editor.setCursorBufferPosition([1,1]) // Because it starts from zero
            expect(2).toEqual(GitLink.getCurrentLineNumber())
            editor.setCursorBufferPosition([2,1]) // Because it starts from zero
            expect(3).toEqual(GitLink.getCurrentLineNumber())
            editor.setCursorBufferPosition([2,0]) // Because it starts from zero
            expect(3).toEqual(GitLink.getCurrentLineNumber())
            editor.setCursorBufferPosition([0,0]) // Because it starts from zero
            expect(1).toEqual(GitLink.getCurrentLineNumber())
        })

        // getCurrentSelection
        fit('has to include the correct selections', () => {
            const editor = atom.workspace.getActiveTextEditor()
            editor.setCursorBufferPosition([1,1]) // Because it starts from zero
            editor.selectToBufferPosition([5,5])
            let [start, end] = GitLink.getCurrentSelection()
            expect(2).toEqual(start)
            expect(6).toEqual(end)

            editor.setCursorBufferPosition([1,1]) // Because it starts from zero
            editor.selectToBufferPosition([5,0])
            let [start2, end2] = GitLink.getCurrentSelection()
            expect(2).toEqual(start2)
            expect(5).toEqual(end2)
        })
    })
});
