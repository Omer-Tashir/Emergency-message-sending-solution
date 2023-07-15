export interface Incident {
    uid: string; // PK
    name: string;
    user_employee_number: string;
    event_created_by: string;
    event_closed_by: string;
    event_start_date: Date;
    event_end_date: Date;
    risk: RiskType;
    location: any;
    type: IncidentType;
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