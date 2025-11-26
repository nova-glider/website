const replace = require('replace-in-file');

replace.replaceInFile({
  files: 'src/pages/**/*.ejs',
  from: /<% -/g,
  to: '<%-',
}).then(results => {
  console.log('Modified files:', results.filter(r => r.hasChanged).map(r => r.file));
}).catch(console.error);