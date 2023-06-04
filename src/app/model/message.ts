export interface OutgoingMessage {
    uid?: string;
    receiver: string;
    toPhone: string;
    group: string;
    type: MessageDeliveryType;
    status: MessageStatus;
    lastMessageSendDate: Date;
    messageCount: number;
    message: string;
    date?: Date
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