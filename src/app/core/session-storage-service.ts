import { Injectable } from '@angular/core';
import { Incident } from '../model/incident';
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

  public clear() {
    sessionStorage.clear(); 
  }
}