
export type EntryType = 'VISITOR' | 'VEHICLE';

export interface BaseEntry {
  id: string;
  timestamp: string;
  chefPoste: string;
  accessPoint: string;
  type: EntryType;
  heureEntree: string;
  heureSortie: string;
  destination: string;
  observation: string;
  registration: string;
  societe: string;
}

export interface VisitorEntry extends BaseEntry {
  visitorName: string;
  personVisited: string;
  cin: string;
  isAnnounced: boolean;
}

export interface VehicleEntry extends BaseEntry {
  vehicleType: string;
  driverName: string;
  bonNumber: string;
}

export type LogEntry = VisitorEntry | VehicleEntry;

export type Language = 'FR' | 'AR';
