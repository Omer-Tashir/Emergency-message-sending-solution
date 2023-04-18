export interface OutgoingMessage {
    receiver: string;
    toPhone: string;
    type: MessageDeliveryType;
    status: MessageStatus;
}

export enum MessageDeliveryType {
    SMS = 'סמס',
    WHATSUP = 'ווטסאפ',
    PHONE_CALL = 'שיחת טלפון',
    KOSHER_PHONE = 'טלפון כשר',
}

export enum MessageStatus {
    PENDING = 'בתהליך',
    FAILURE = 'כישלון',
    DECLINED = 'נדחה',
    APPROVED = 'התקבל בהצלחה'
}