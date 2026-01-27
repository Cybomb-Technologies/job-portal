const fs = require('fs');

const output = [
    'Checking Email Environment Variables...',
    `SMTP_HOST: ${process.env.SMTP_HOST ? `'${process.env.SMTP_HOST}'` : 'UNDEFINED'}`,
    `SMTP_PORT: ${process.env.SMTP_PORT ? `'${process.env.SMTP_PORT}'` : 'UNDEFINED'}`,
    `SMTP_USER: ${process.env.SMTP_USER ? 'SET (Hidden)' : 'UNDEFINED'}`,
    `SMTP_PASS: ${process.env.SMTP_PASS ? 'SET (Hidden)' : 'UNDEFINED'}`,
    `EMAIL_SERVICE: ${process.env.EMAIL_SERVICE ? `'${process.env.EMAIL_SERVICE}'` : 'UNDEFINED'}`
].join('\n');

console.log(output);
fs.writeFileSync('env_check.txt', output);

if (!process.env.SMTP_HOST) {
    console.log('ERROR: SMTP_HOST is missing.');
}
