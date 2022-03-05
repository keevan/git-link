import { toShortHash } from '../git'
import tmpl from 'reverse-string-template'

export default function ({ repo }) {
    return {
        getRepoDisplay: () => {
            const template = 'https://{%endpoint%}/{%username%}/{{repository}}'
            const { username, repository } = tmpl(repo, template)
            return `${username}/${repository}`
        },
        getPullRequestsLink: () => {
            return `${repo}/pulls`
        },
        getIssuesLink: () => {
            return `${repo}/issues`
        },
        hostsRepo: ({ host, response }) => {
            // If it's the known public domain (GitHub.com)
            if (host.toLowerCase() === 'github.com') {
                return true
            }

            // It's github if the header has this key
            if (response.headers['x-github-request-id']) {
                return true
            }

            // It's github if there is a cookie with this session key (_gh_sess or _octo)
            // TODO ?

            // Otherwise..
            return false
        },
        getSelectionLink: ({ commitHash, relativePath, start, end, blame = false, history = false }) => {
            let mode = 'blob'
            if (blame) {
                mode = 'blame'
            } else if (history) {
                mode = 'commits'
            }
            return `${repo}/${mode}/${toShortHash(commitHash)}${relativePath}#L${start}-L${end}`
        },
        getLineLink: ({ commitHash, relativePath, start, blame = false, history = false }) => {
            let mode = 'blob'
            if (blame) {
                mode = 'blame'
            } else if (history) {
                mode = 'commits'
            }
            return `${repo}/${mode}/${toShortHash(commitHash)}${relativePath}#L${start}`
        },
        getFileLink: ({ commitHash, relativePath, blame = false, history = false }) => {
            let mode = 'blob'
            if (blame) {
                mode = 'blame'
            } else if (history) {
                mode = 'commits'
            }
            return `${repo}/${mode}/${toShortHash(commitHash)}${relativePath}`
        },
    }
}
