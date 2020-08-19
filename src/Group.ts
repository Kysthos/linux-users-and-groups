import { Ranges } from './UserGroupStore';
import { User } from './User';

export class Group {
  private _groupName: string;
  private _gid: number;
  private _userNames: string[];
  private _members: User[] = [];
  private _primaryMember: User | undefined;

  static ranges: Ranges | undefined;

  constructor(groupLine: string) {
    const [groupName, password, gid, members] = groupLine.split(':');
    this._groupName = groupName;
    this._gid = parseInt(gid);
    this._userNames = members.split(',').filter((name) => name);
  }

  public get gid() {
    return this._gid;
  }

  public get name() {
    return this._groupName;
  }

  public get members() {
    if (this._primaryMember) return [this._primaryMember, ...this._members];
    return [...this._members];
  }

  public get memberNames() {
    if (this._primaryMember)
      return [this._primaryMember.name, ...this._userNames];
    return this._userNames.slice();
  }

  public isSystemGroup() {
    if (!Group.ranges) throw new Error('too early');
    return (
      Group.ranges.FIRST_SYSTEM_GID <= this._gid &&
      this._gid <= Group.ranges.LAST_SYSTEM_GID
    );
  }

  public isRegularGroup() {
    if (!Group.ranges) throw new Error('too early');

    return (
      Group.ranges.FIRST_GID <= this._gid && this._gid <= Group.ranges.LAST_GID
    );
  }

  public setMembers(members: User[] = []) {
    this._members = members.filter((user) => user);
  }

  public setPrimaryMember(primaryMember: User) {
    this._primaryMember = primaryMember;
  }

  public setRanges(ranges: Ranges) {
    Group.ranges = ranges;
  }
}
