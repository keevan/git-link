
const filePath = () => {
    return atom.workspace.getActiveTextEditor().getBuffer().getPath();
}

const fileDirectory = (filePath) => {
    return path.dirname(filePath);
}

const forwardFilePath = (filePath) => {
    return filePath.replace(/\\/g, '/');
}

export default {
    filePath,
    fileDirectory,
    forwardFilePath,
};
