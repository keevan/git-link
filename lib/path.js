'use babel';

const filePath = () => {
    return atom.workspace.getActiveTextEditor().getBuffer().getPath();
}

const fileDirectory = () => {
    return path.dirname(filePath());
}

const forwardFilePath = () => {
    return filePath().replace(/\\/g, '/');
}

export default {
    filePath,
    fileDirectory,
    forwardFilePath,
};
