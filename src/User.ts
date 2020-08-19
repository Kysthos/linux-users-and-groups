import { Group } from './Group';
import { Ranges } from './UserGroupStore';

export class User {
  private _userName: string;
  private _uid: number;
  private _gid: number;
  private _fn: string;
  private _home: string;
  private _shell: string;
  private _groups: Group[] = [];
  private _ranges: Ranges | undefined;

  constructor(passwdLine: string) {
    const [userName, password, uid, gid, fn, home, shell] = passwdLine.split(
      ':'
    );
    this._userName = userName;
    this._uid = parseInt(uid);
    this._gid = parseInt(gid);
    this._fn = fn || '';
    this._home = home || '';
    this._shell = shell || '';
  }

  public get name() {
    return this._userName;
  }

  public get uid() {
    return this._uid;
  }

  public get gid() {
    return this._gid;
  }

  public get fullName() {
    return this._fn;
  }

  public get shell() {
    return this._shell;
  }

  public get homeDir() {
    return this._home;
  }

  public get primaryGroup() {
    return this._groups[0];
  }

  public get groups() {
    return this._groups.slice();
  }

  public get secondaryGroups() {
    return this._groups.slice(1);
  }

  public isSystemUser() {
    if (!this._ranges) throw new Error('too early');
    return (
      this._ranges.FIRST_SYSTEM_UID <= this._uid &&
      this._uid <= this._ranges.LAST_SYSTEM_UID
    );
  }

  public isRegularUser() {
    if (!this._ranges) throw new Error('too early');

    return (
      this._ranges.FIRST_UID <= this._uid && this._uid <= this._ranges.LAST_UID
    );
  }

  public setGroups(primary: Group, secondary: Group[] = []) {
    this._groups = [primary, ...secondary];
  }

  public setRanges(ranges: Ranges) {
    this._ranges = ranges;
  }

  public id(color = false) {
    return [
      `uid=${this._uid}(${this._userName})`,
      `gid=${this._gid}(${this.primaryGroup.name})`,
      `groups=${this.groups
        .map((group) => `${group.gid}(${group.name})`)
        .join(',')}`,
    ].join(' ');
  }
}
