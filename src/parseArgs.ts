import yargs from 'yargs';

export default yargs
  .parserConfiguration({
    'duplicate-arguments-array': false,
  })
  .command(
    '$0 [OPTIONS]',
    'Displays information about users and groups. By default it displays all users in `UserName (UID)` format.'
  )
  .option('i', {
    alias: 'id',
    demandOption: false,
    default: false,
    describe: 'display id like output, ignored when -g option is set',
    type: 'boolean',
  })
  .option('r', {
    alias: 'regular',
    demandOption: false,
    default: false,
    describe: 'display information only about regular users/groups',
    type: 'boolean',
  })
  .option('s', {
    alias: 'system',
    demandOption: false,
    default: false,
    describe: 'display information only about system users/groups',
    type: 'boolean',
  })
  .option('m', {
    alias: 'members',
    demandOption: false,
    default: false,
    describe: 'display group members',
    type: 'boolean',
  })
  .option('g', {
    alias: 'groups',
    demandOption: false,
    default: false,
    describe: 'display information only about groups',
    type: 'boolean',
  })
  .option('u', {
    alias: 'users',
    demandOption: false,
    default: true,
    describe: 'display information only about users',
    type: 'boolean',
  })
  .option('n', {
    alias: 'name',
    demandOption: false,
    default: '',
    describe: 'info about a user/group with name',
    type: 'string',
  })
  .option('b', {
    alias: 'gid',
    demandOption: false,
    default: undefined,
    describe: 'info about a user/group with gid',
    type: 'number',
  })
  .option('f', {
    alias: 'uid',
    demandOption: false,
    default: undefined,
    describe: 'info about a user with uid',
    type: 'number',
  })
  .option('o', {
    alias: 'only-names',
    demandOption: false,
    default: false,
    describe: 'display names only',
    type: 'boolean',
  })
  .option('d', {
    alias: 'delimiter',
    demandOption: false,
    default: ' ',
    describe: 'delimiter for -n option',
    type: 'string',
  })
  .help('help')
  .alias('h', 'help')
  .alias('v', 'version').argv;
