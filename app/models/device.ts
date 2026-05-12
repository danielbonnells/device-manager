import { TimeZone } from "./timezone";

export interface Device {
  id: number;
  uniqueId: string;
  name: string;
  userId: number;
  apiKey: string;
  timeZone: TimeZone;
  registeredAt: string; 
  routeTopics: any[];
}