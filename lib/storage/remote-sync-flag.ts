let isApplyingRemote = false;

export function setApplyingRemote(value: boolean): void {
  isApplyingRemote = value;
}

export function getApplyingRemote(): boolean {
  return isApplyingRemote;
}
