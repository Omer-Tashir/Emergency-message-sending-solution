export interface Incident {
    uid: string; // PK
    name: string;
    date: Date;
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