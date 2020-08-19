import { promises as fs } from 'fs';
import { User } from './User';
import { Group } from './Group';

const adduserConfFile = '/etc/adduser.conf';
const passwdFile = '/etc/passwd';
const groupFile = '/etc/group';

export interface Ranges {
  FIRST_SYSTEM_UID: number;
  LAST_SYSTEM_UID: number;
  FIRST_SYSTEM_GID: number;
  LAST_SYSTEM_GID: number;
  FIRST_UID: number;
  LAST_UID: number;
  FIRST_GID: number;
  LAST_GID: number;
}

export class UserGroupStore {
  private _users: User[] = [];
  private _groups: Group[] = [];
  private _ranges: Ranges = {
    FIRST_SYSTEM_UID: -9999,
    LAST_SYSTEM_UID: -9999,
    FIRST_SYSTEM_GID: -9999,
    LAST_SYSTEM_GID: -9999,
    FIRST_UID: -9999,
    LAST_UID: -9999,
    FIRST_GID: -9999,
    LAST_GID: -9999,
  };

  public get users() {
    return [...this._users];
  }

  public get groups() {
    return [...this._groups];
  }

  init() {
    return new Promise((resolve, reject) => {
      let finished = 0;
      const expected = 3;

      const onFinish = () => {
        if (++finished !== expected) return;

        for (const user of this._users) {
          const primary = this.findGroupByGid(user.gid);
          if (!primary) throw new Error('user needs to have a primary group');
          const secondary = this.findGroupsByUserName(user.name);
          user.setGroups(primary, secondary);
        }

        for (const group of this._groups) {
          const primaryMember = this.findUserByGid(group.gid);
          const members = group.memberNames.map((name) =>
            this.findUserByName(name)
          ) as User[];
          if (primaryMember) group.setPrimaryMember(primaryMember);
          group.setMembers(members);
        }

        resolve();
      };

      fs.readFile(adduserConfFile, 'utf8')
        .then((content) => {
          this.parseAdduserConf(content);
          onFinish();
        })
        .catch((err) => reject(err));

      fs.readFile(passwdFile, 'utf8')
        .then((content) => {
          this.parsePasswd(content);
          onFinish();
        })
        .catch((err) => reject(err));

      fs.readFile(groupFile, 'utf8')
        .then((content) => {
          this.parseGroup(content);
          onFinish();
        })
        .catch((err) => reject(err));
    });
  }

  public findUserByUid(uid: number) {
    for (const user of this._users) if (user.uid === uid) return user;
    return null;
  }

  public findUserByGid(gid: number) {
    for (const user of this._users) if (user.gid === gid) return user;
    return null;
  }

  public findUserByName(userName: string) {
    for (const user of this._users) if (user.name === userName) return user;
    return null;
  }

  public findGroupByGid(gid: number) {
    for (const group of this._groups) if (group.gid === gid) return group;
    return null;
  }

  public findGroupsByUserName(userName: string) {
    const groups = [];
    for (const group of this._groups)
      if (group.memberNames.includes(userName)) groups.push(group);
    return groups;
  }

  private parseAdduserConf(content: string) {
    const match = (str: string) => {
      const regex = new RegExp(`${str}=(\\d+)`);
      const matched = content.match(regex);
      if (!matched) throw new Error('wrong with regex...');
      return parseInt(matched[1]);
    };
    this._ranges.FIRST_SYSTEM_UID = match('FIRST_SYSTEM_UID');
    this._ranges.LAST_SYSTEM_UID = match('LAST_SYSTEM_UID');
    this._ranges.FIRST_SYSTEM_GID = match('FIRST_SYSTEM_GID');
    this._ranges.LAST_SYSTEM_GID = match('LAST_SYSTEM_GID');
    this._ranges.FIRST_UID = match('FIRST_UID');
    this._ranges.LAST_UID = match('LAST_UID');
    this._ranges.FIRST_GID = match('FIRST_GID');
    this._ranges.LAST_GID = match('LAST_GID');
  }

  private parsePasswd(content: string) {
    const lines = content.split('\n');
    for (const line of lines) {
      if (!line || line.startsWith('#')) continue;
      const user = new User(line);
      user.setRanges(this._ranges);
      this._users.push(user);
    }
  }

  private parseGroup(content: string) {
    const lines = content.split('\n');
    for (const line of lines) {
      if (!line || line.startsWith('#')) continue;
      const group = new Group(line);
      group.setRanges(this._ranges);
      this._groups.push(group);
    }
  }

  public getSystemUsers() {
    const users = [];
    for (const user of this._users) if (user.isSystemUser()) users.push(user);
    return users;
  }

  public getUsers() {
    const users = [];
    for (const user of this._users) if (user.isRegularUser()) users.push(user);
    return users;
  }

  public getSystemGroups() {
    const groups = [];
    for (const group of this._groups)
      if (group.isSystemGroup()) groups.push(group);
    return groups;
  }

  public getGroups() {
    const groups = [];
    for (const group of this._groups)
      if (group.isRegularGroup()) groups.push(group);
    return groups;
  }

  public get userNames() {
    return this._users.map((user) => user.name);
  }

  public printRegularIds() {
    const regularUsers = this.getUsers();
    this._printIds(regularUsers);
  }

  public printSystemIds() {
    const systemUsers = this.getSystemUsers();
    this._printIds(systemUsers);
  }

  public printAllIds() {
    this._printIds(this._users);
  }

  private _printIds(users: User[]) {
    for (const user of users) console.log(user.id());
  }
}
