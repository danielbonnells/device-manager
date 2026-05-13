import { RouteDto } from "./routeDto";

export interface Station {
    id: number;
    gtfsStopId: string;
    // stationId: number;
    // complexId: number;
    // division: string;
    line: string;
    stopName: string;
    // borough: string;
    // cbd: boolean;
    daytimeRoutes: string;
    // structure: string;
    gtfsLatitude: string;
    gtfsLongitude: string;
    // northDirectionLabel: string;
    // southDirectionLabel: string;
    // ada: number;
    // adaNorthbound: number;
    // adaSouthbound: number;
    // adaNotes: string;
    // georeference: string;
    routes: { [routeKey: string]:  RouteDto  };
}

