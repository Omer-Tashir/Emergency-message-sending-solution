import { MessageDeliveryType } from "./message";

export interface Trip {
    uid: string; // PK
    incidentUid: string; // FK [incidents]
    name: string;
    tutor: TripTutor;
    groupSize: number;
    currentLocation: TripLocation;
}

export interface TripTutor {
    accountName: string;
    firstname: string;
    lastname: string;
    phone1: string;
    phone2: string;
    deliveryType: MessageDeliveryType;
    maleVoice: boolean; // מעדיף קול של גבר?
}

export interface TripLocation {
    latitude: number;
    longitude: number;
    radiusLat: number;
    radiusLong: number;
}