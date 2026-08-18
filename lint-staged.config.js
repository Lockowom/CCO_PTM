const isDist = (file) => /(^|\/)dist\//.test(file);

const notDist = (files) => files.filter((file) => !isDist(file));

const quote = (file) => `"${file}"`;

export default {
  '*.{js,jsx,ts,tsx}': (files) => {
    const match = notDist(files);
    if (!match.length) return [];
    const filesArg = match.map(quote).join(' ');
    return [`eslint --fix ${filesArg}`, `prettier --write ${filesArg}`];
  },
  '*.{json,md,css}': (files) => {
    const match = notDist(files);
    if (!match.length) return [];
    return `prettier --write ${match.map(quote).join(' ')}`;
  }
};
