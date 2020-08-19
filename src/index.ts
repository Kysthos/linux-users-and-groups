import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import { UserGroupStore } from './UserGroupStore';
import args from './parseArgs';

const COMMAND_NAME = 'lsuser';

const {
  g: groupsOnly,
  r: regularOnly,
  s: systemOnly,
  b: gidToFind,
  f: uidToFind,
  o: namesOnly,
  d: delimiter,
  i: displayId,
  m: displayMembers,
  n: nameToFind,
} = args;

const main = async () => {
  try {
    const store = new UserGroupStore();
    await store.init();

    // dealing with groups
    if (groupsOnly) {
      // pick up groups
      let groups = regularOnly
        ? store.getGroups()
        : systemOnly
        ? store.getSystemGroups()
        : store.groups;

      // search for group with provided gid
      if (gidToFind) groups = groups.filter((group) => group.gid === gidToFind);

      // search for group with provided name
      if (nameToFind)
        groups = groups.filter((group) => group.name === nameToFind);

      // display names only
      if (namesOnly) {
        printNames(groups);
        process.exit(0);
      }

      // default behavior
      for (const group of groups) {
        let info = '';
        info += group.name;
        info += ' ';
        info += '(' + group.gid + ')';

        if (displayMembers) {
          const members = group.members.map(
            (user) => `${user.name} (${user.uid})`
          );
          info += ' members: ';
          info += members.join(', ');
        }

        console.log(info);
      }

      process.exit(0);
    }

    // dealing with users
    if (args.u) {
      let users = regularOnly
        ? store.getUsers()
        : systemOnly
        ? store.getSystemUsers()
        : store.users;

      // search for user with provided gid
      if (gidToFind) users = users.filter((user) => user.gid === gidToFind);

      // search for user with provided uid
      if (uidToFind) users = users.filter((user) => user.uid === uidToFind);

      // search for user with provided name
      if (nameToFind) users = users.filter((user) => user.name === nameToFind);

      // id like output
      if (displayId) {
        for (const user of users) console.log(user.id());
        process.exit(0);
      }

      // show only names
      if (namesOnly) {
        printNames(users);
        process.exit(0);
      }

      // default behavior
      for (const user of users) console.log(`${user.name} (${user.uid})`);

      process.exit(0);
    }
  } catch (err) {
    const errorLog = join(tmpdir(), `${Date.now()}_${COMMAND_NAME}`);
    try {
      await fs.writeFile(errorLog, err);
    } catch (err) {
      console.error(
        `Something went wrong. Wasn\'t able to write a log file to ${errorLog}`
      );
      process.exit(1);
    }
    console.error(`Something went wrong. Error log saved to ${errorLog}`);
    process.exit(1);
  }
};

interface ObjectWithName {
  name: string;
}
const printNames = (nameObjects: ObjectWithName[]) => {
  const names = nameObjects.map((obj) => obj.name);
  console.log(names.join(delimiter));
};

main();
