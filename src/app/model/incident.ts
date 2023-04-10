export interface Incident {
    uid: string;
    name: string;
    date: Date;
    location: string;
    risk: RiskType;
    type: IncidentType;
    successRate: number;
}

export enum IncidentType {
    Floods = 'שיטפונות',
    NaturalDisaster = 'מפגע טבע',
}

export enum RiskType {
    Low = 'נמוך',
    Medium = 'בינוני',
    High = 'גבוה',
}