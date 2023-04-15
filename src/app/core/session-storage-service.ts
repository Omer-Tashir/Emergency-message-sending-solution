import { Injectable } from '@angular/core';
import { Incident } from '../model/incident';
import { Trip } from '../model/trip';
import { User } from '../model/user';

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

  public setItem(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }
    
  public getItem(key: string): any { 
    return sessionStorage.getItem(key);
  }

  public removeItem(key:string) {
    sessionStorage.removeItem(key);
  }

  getLoggedInUser(): User | undefined {
    const loadUser = this.getItem('user');
    if (!!loadUser) {
      return JSON.parse(loadUser) as User;
    }

    return undefined;
  }

  getUsers(): User[] {
    const loadUsers = this.getItem('users');
    if (!!loadUsers) {
      return JSON.parse(loadUsers) as User[];
    }

    return [];
  }

  getIncidents(): Incident[] {
    const loadIncidents = this.getItem('incidents');
    if (!!loadIncidents) {
      return JSON.parse(loadIncidents) as Incident[];
    }

    return [];
  }

  getIncident(uid: string): Incident | undefined {
    const incidents = this.getIncidents();
    if (incidents?.length) {
      return incidents.find(i => i.uid === uid);
    }
    return undefined;
  }

  getTrips(): Trip[] {
    const loadTrips = this.getItem('trips');
    if (!!loadTrips) {
      return JSON.parse(loadTrips) as Trip[];
    }

    return [];
  }

  getTripsInRadius(): Trip[] {
    const loadTrips = this.getItem('tripsInRadius');
    if (!!loadTrips) {
      return JSON.parse(loadTrips) as Trip[];
    }

    return [];
  }

  public clear() {
    sessionStorage.clear(); 
  }
}