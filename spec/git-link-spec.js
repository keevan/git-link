'use babel';

import GitLink from '../lib/git-link';
import platform from '../lib/platform';
import * as platforms from '../lib/platforms'

// Use the command `window:run-package-specs` (ctrl+shift+y) to run specs.
describe('GitLink', () => {

    describe('Check if git is installed', () => {
        // TODO
    })

    describe('Parsing functions - getRepoFromOrigin', () => {
        it("has to support the GIT url as origin", () => {
            // Expectations
            const origin = 'git@github.com:keevan/git-link.git'
            expect('https://github.com/keevan/git-link').toEqual(GitLink.getRepoFromOrigin(origin))
        })
        it("has to support the HTTPS url has origin", () => {
            // Expectations
            const origin = 'https://github.com/keevan/git-link.git'
            expect('https://github.com/keevan/git-link').toEqual(GitLink.getRepoFromOrigin(origin))
        })
    })

    describe('Test platform support - github', () => {
        it("has to detect github", () => {
            const urls = [
             'git@github.com:keevan/git-link.git',
             'https://github.com/keevan/git-link',
            ]
            urls.forEach(async url => {
                const repo = GitLink.getRepoFromOrigin(url)
                const p = await platform.create({ repo })
                expect('github').toEqual(p.type)
                const resolvedRepo = p.getRepo()
                expect('https://github.com/keevan/git-link').toEqual(resolvedRepo)
            })
        })
    })

    describe('Test platform support - gitlab', () => {
        it("has to detect gitlab", () => {
            const urls = [
             'git@gitlab.com:user/repo.git',
             'https://gitlab.com/user/repo.git',
            ]
            urls.forEach(async url => {
                const repo = GitLink.getRepoFromOrigin(url)
                const p = await platform.create({ repo })
                expect('gitlab').toEqual(p.type)
                const resolvedRepo = p.getRepo()
                expect('https://gitlab.com/user/repo').toEqual(resolvedRepo)
            })
        })
    })

    describe('Test platform support - azure', () => {
        it("has to detect azure", () => {
            const urls = [
             'git@ssh.dev.azure.com:v3/keevan/Test/repo',
             'https://dev.azure.com/keevan/Test/_git/repo',
             'https://keevan@dev.azure.com/keevan/Test/_git/repo',
            ]
            urls.forEach(async url => {
                const repo = GitLink.getRepoFromOrigin(url)
                const p = await platform.create({ repo })
                expect('azure').toEqual(p.type)
                const resolvedRepo = p.getRepo()
                expect('https://dev.azure.com/keevan/Test/_git/repo').toEqual(resolvedRepo)
            })
        })
    })

    describe('Test platform support - bitbucket', () => {
        it("has to detect bitbucket", () => {
            const urls = [
             'https://bitbucket.org/user/repo.git',
             'git@bitbucket.org:user/repo.git',
             'https://username@bitbucket.org/user/repo.git',
            ]
            urls.forEach(async url => {
                const repo = GitLink.getRepoFromOrigin(url)
                const p = await platform.create({ repo })
                expect('bitbucket').toEqual(p.type)
                const resolvedRepo = p.getRepo()
                expect('https://bitbucket.org/user/repo').toEqual(resolvedRepo)
            })
        })
    })

    describe('Parsing functions - getCommitHashFromLog', () => {
        it("has to return the expected hash format", () => {
            // Expectations
            const log = '014ed5d66c0e5afc7badd8fde666e399e43aa882 (HEAD -> main, origin/main) Add CI for github workflows'
            expect('014ed5d66c0e5afc7badd8fde666e399e43aa882').toEqual(GitLink.getCommitHashFromLog(log))
            expect('014ed5d').toEqual(GitLink.getShortCommitHash('014ed5d66c0e5afc7badd8fde666e399e43aa882'))
        })
    })

    describe('Parsing functions - cleanPath', () => {
        it('has to stay the same', () => {
            // Expectations
            const path = '/lib/git-link.js'
            expect('/lib/git-link.js').toEqual(GitLink.cleanPath(path))
        })
        it('has to support Windows paths', () => {
            // Expectations
            const path = '\\lib\\git-link.js'
            expect('/lib/git-link.js').toEqual(GitLink.cleanPath(path))
        })
        it('has to be properly encoded', () => {
            // Expectations
            const path = '/[folder]-[id]/file#example'
            expect('/%5Bfolder%5D-%5Bid%5D/file%23example').toEqual(GitLink.cleanPath(path))
        })
        it('has to add plain=1 as a parameter', () => {
            // Expectations
            const path = '/README.md'
            expect('/README.md?plain=1').toEqual(GitLink.cleanPath(path))
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
        it('has to be on the correct line', () => {
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
        it('has to include the correct selections', () => {
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
