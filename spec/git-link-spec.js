'use babel';

import GitLink from '../lib/git-link';
import { toShortHash } from '../lib/git';
import platform from '../lib/platform';

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
        it("has to detect github", async () => {
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
        it("has to support relevant links", async () => {
            // Given a github repo
            const url = 'git@github.com:keevan/git-link.git'
            const commitHash = 'abc1234'
            // Resolve the platform
            const repo = GitLink.getRepoFromOrigin(url)
            const p = await platform.create({ repo })
            // Issues page
            expect('https://github.com/keevan/git-link/issues').toEqual(p.getIssuesLink())
            // Pull Requests page
            expect('https://github.com/keevan/git-link/pulls').toEqual(p.getPullRequestsLink())

            // Test for different types of links (file)
            const relativePath = '/path/to/file'
            // Normal
            expect(`https://github.com/keevan/git-link/blob/${commitHash}${relativePath}`)
                .toEqual(p.getFileLink({ commitHash, relativePath }))
            // Blame
            expect(`https://github.com/keevan/git-link/blame/${commitHash}${relativePath}`)
                .toEqual(p.getFileLink({ commitHash, relativePath, blame: true }))
            // History
            expect(`https://github.com/keevan/git-link/commits/${commitHash}${relativePath}`)
                .toEqual(p.getFileLink({ commitHash, relativePath, history: true }))
            // Test for different types of links (selection)
            const start = 10
            const end = 15
            // Normal - line
            expect(`https://github.com/keevan/git-link/blob/${commitHash}${relativePath}#L10`)
                .toEqual(p.getLineLink({ commitHash, relativePath, start }))
            // Normal - selection
            expect(`https://github.com/keevan/git-link/blob/${commitHash}${relativePath}#L10-L15`)
                .toEqual(p.getSelectionLink({ commitHash, relativePath, start, end }))
            // Blame - line
            expect(`https://github.com/keevan/git-link/blame/${commitHash}${relativePath}#L10`)
                .toEqual(p.getLineLink({ commitHash, relativePath, start, blame: true }))
            // Blame - selection
            expect(`https://github.com/keevan/git-link/blame/${commitHash}${relativePath}#L10-L15`)
                .toEqual(p.getSelectionLink({ commitHash, relativePath, start, end, blame: true }))
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
        it("has to support relevant links", async () => {
            // Given a github repo
            const url = 'git@gitlab.com:user/repo.git'
            const commitHash = 'abc1234'
            // Resolve the platform
            const repo = GitLink.getRepoFromOrigin(url)
            const p = await platform.create({ repo })
            // Issues page
            expect('https://gitlab.com/user/repo/-/issues').toEqual(p.getIssuesLink())
            // Pull Requests page
            expect('https://gitlab.com/user/repo/-/merge_requests').toEqual(p.getPullRequestsLink())
            // Test for different types of links (file)
            const relativePath = '/path/to/file'
            // Normal
            expect(`https://gitlab.com/user/repo/-/blob/${commitHash}${relativePath}`)
                .toEqual(p.getFileLink({ commitHash, relativePath }))
            // Blame
            expect(`https://gitlab.com/user/repo/-/blame/${commitHash}${relativePath}`)
                .toEqual(p.getFileLink({ commitHash, relativePath, blame: true }))
            // History
            expect(`https://gitlab.com/user/repo/-/commits/${commitHash}${relativePath}`)
                .toEqual(p.getFileLink({ commitHash, relativePath, history: true }))
            // Test for different types of links (selection)
            const start = 10
            const end = 15
            // Normal - line
            expect(`https://gitlab.com/user/repo/-/blob/${commitHash}${relativePath}#L10`)
                .toEqual(p.getLineLink({ commitHash, relativePath, start }))
            // Normal - selection
            expect(`https://gitlab.com/user/repo/-/blob/${commitHash}${relativePath}#L10-15`)
                .toEqual(p.getSelectionLink({ commitHash, relativePath, start, end }))
            // Blame - line
            expect(`https://gitlab.com/user/repo/-/blame/${commitHash}${relativePath}#L10`)
                .toEqual(p.getLineLink({ commitHash, relativePath, start, blame: true }))
            // Blame - selection
            expect(`https://gitlab.com/user/repo/-/blame/${commitHash}${relativePath}#L10-15`)
                .toEqual(p.getSelectionLink({ commitHash, relativePath, start, end, blame: true }))
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

        it("has to support relevant links", async () => {
            // Given a github repo
            const url = 'git@ssh.dev.azure.com:v3/keevan/Test/repo'
            const commitHash = 'abc1234567890abdef00abc1234567890abdef00'
            // Resolve the platform
            const repo = GitLink.getRepoFromOrigin(url)
            const p = await platform.create({ repo })
            // Issues page
            // Does not appear to have this page? (well, not that I'm aware of)
            // Pull Requests page
            expect('https://dev.azure.com/keevan/Test/_git/repo/pullrequests').toEqual(p.getPullRequestsLink())
            // Test for different types of links (file)
            const relativePath = '/path/to/file'
            // Normal
            expect(`https://dev.azure.com/keevan/Test/_git/repo?path=${relativePath}&version=GC${commitHash}`)
                .toEqual(p.getFileLink({ commitHash, relativePath }))
            // 'Blame' is annotate for bitbucket - https://jira.atlassian.com/browse/BCLOUD-16318
            // https://dev.azure.com/keevan/Test/_git/Another?path=%2FREADME.md&_a=blame&version=GC65bf33446688197b485be19b7d11d074230e8647
            expect(`https://dev.azure.com/keevan/Test/_git/repo?path=${relativePath}&version=GC${commitHash}&_a=blame`)
                .toEqual(p.getFileLink({ commitHash, relativePath, blame: true }))
            // History
            expect(`https://dev.azure.com/keevan/Test/_git/repo?path=${relativePath}&version=GC${commitHash}&_a=history`)
                .toEqual(p.getFileLink({ commitHash, relativePath, history: true }))
            // Test for different types of links (selection)
            const start = 10
            const end = 15
            const startColumn = 3
            const endColumn = 5
            // Normal - line
            expect(`https://dev.azure.com/keevan/Test/_git/repo?path=${relativePath}&version=GC${commitHash}&line=${start}&lineEnd=${start}&lineStartColumn=${startColumn}&lineEndColumn=${endColumn}`)
                .toEqual(p.getLineLink({ commitHash, relativePath, start, startColumn, endColumn }))
            // Normal - selection
            expect(`https://dev.azure.com/keevan/Test/_git/repo?path=${relativePath}&version=GC${commitHash}&line=${start}&lineEnd=${end}&lineStartColumn=${startColumn}&lineEndColumn=${endColumn}`)
                .toEqual(p.getSelectionLink({  commitHash, relativePath, start, end, startColumn, endColumn }))
            // Blame - line
            expect(`https://dev.azure.com/keevan/Test/_git/repo?path=${relativePath}&version=GC${commitHash}&line=${start}&lineEnd=${start}&lineStartColumn=${startColumn}&lineEndColumn=${endColumn}&_a=blame`)
                .toEqual(p.getLineLink({ commitHash, relativePath, start, startColumn, endColumn, blame: true }))
            // Blame - selection
            expect(`https://dev.azure.com/keevan/Test/_git/repo?path=${relativePath}&version=GC${commitHash}&line=${start}&lineEnd=${end}&lineStartColumn=${startColumn}&lineEndColumn=${endColumn}&_a=blame`)
                .toEqual(p.getSelectionLink({   commitHash, relativePath, start, end, startColumn, endColumn, blame: true }))
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

        it("has to support relevant links", async () => {
            // Given a github repo
            const url = 'git@bitbucket.org:user/repo.git'
            const commitHash = 'abc1234'
            // Resolve the platform
            const repo = GitLink.getRepoFromOrigin(url)
            const p = await platform.create({ repo })
            // Issues page
            expect('https://bitbucket.org/user/repo/issues').toEqual(p.getIssuesLink())
            // Pull Requests page
            expect('https://bitbucket.org/user/repo/pull-requests').toEqual(p.getPullRequestsLink())
            // Test for different types of links (file)
            const relativePath = '/path/to/file'
            // Normal
            expect(`https://bitbucket.org/user/repo/src/${commitHash}${relativePath}`)
                .toEqual(p.getFileLink({ commitHash, relativePath }))
            // 'Blame' is annotate for bitbucket - https://jira.atlassian.com/browse/BCLOUD-16318
            expect(`https://bitbucket.org/user/repo/annotate/${commitHash}${relativePath}`)
                .toEqual(p.getFileLink({ commitHash, relativePath, blame: true }))
            // History
            expect(`https://bitbucket.org/user/repo/commits/${commitHash}${relativePath}`)
                .toEqual(p.getFileLink({ commitHash, relativePath, history: true }))
            // Test for different types of links (selection)
            const start = 10
            const end = 15
            // Normal - line
            expect(`https://bitbucket.org/user/repo/src/${commitHash}${relativePath}#-10`)
                .toEqual(p.getLineLink({ commitHash, relativePath, start }))
            // Normal - selection
            expect(`https://bitbucket.org/user/repo/src/${commitHash}${relativePath}#-10:15`)
                .toEqual(p.getSelectionLink({ commitHash, relativePath, start, end }))
            // Blame - line
            expect(`https://bitbucket.org/user/repo/annotate/${commitHash}${relativePath}#-10`)
                .toEqual(p.getLineLink({ commitHash, relativePath, start, blame: true }))
            // Blame - selection
            expect(`https://bitbucket.org/user/repo/annotate/${commitHash}${relativePath}#-10:15`)
                .toEqual(p.getSelectionLink({ commitHash, relativePath, start, end, blame: true }))
        })
    })

    describe('Parsing functions - getCommitHashFromLog', () => {
        it("has to return the expected hash format", () => {
            // Expectations
            const log = '014ed5d66c0e5afc7badd8fde666e399e43aa882 (HEAD -> main, origin/main) Add CI for github workflows'
            expect('014ed5d66c0e5afc7badd8fde666e399e43aa882').toEqual(GitLink.getCommitHashFromLog(log))
            expect('014ed5d').toEqual(toShortHash('014ed5d66c0e5afc7badd8fde666e399e43aa882'))
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
