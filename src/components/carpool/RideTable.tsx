import React from 'react';
import { CarpoolBookingList, type CarpoolDashboardProps } from './CarpoolBookingList';

export type RideTableProps = CarpoolDashboardProps;

/**
 * Consolidated into CarpoolBookingList.
 * Retained for backwards compatibility.
 */
export const RideTable: React.FC<CarpoolDashboardProps> = (props) => {
  return <CarpoolBookingList {...props} />;
};

export default RideTable;
