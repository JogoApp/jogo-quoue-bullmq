export enum StatusSpaceEnum {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  SUSPENDED = 'SUSPENDED',
  PAST_DUE = 'PAST_DUE',
  UNCOMPLETED = 'UNCOMPLETED',
}

export type DataJobType = {
  spaceId: string;
  newStatus: StatusSpaceEnum;
  verifyTrialStatus?: boolean;
};
