import React from 'react';
import { DriverVerificationScreen, type DriverVerificationScreenProps } from './DriverVerificationScreen';

export type DriverVerificationListProps = DriverVerificationScreenProps;

/**
 * Consolidated into DriverVerificationScreen.
 * Retained for backwards compatibility.
 */
export const DriverVerificationList: React.FC<DriverVerificationScreenProps> = (props) => {
  return <DriverVerificationScreen {...props} />;
};

export default DriverVerificationList;
