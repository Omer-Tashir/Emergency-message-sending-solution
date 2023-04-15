export interface Marker {
	lat: number;
	lng: number;
	label: any;
    draggable: boolean;
    content?: string;
    isShown: boolean;
    icon: string;
}