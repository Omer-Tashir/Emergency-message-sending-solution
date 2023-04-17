import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { iif, Observable, of, throwError } from 'rxjs';

import { StorageService } from '../core/session-storage-service';
import { Incident } from '../model/incident';
import { User } from '../model/user';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {

    constructor(
        private db: AngularFirestore,
        private storageService: StorageService
    ) {}

    login(username: string, password: string): Observable<User> {
        return this.db.collection(`users`, ref => ref
                .where('username', '==', username)
                .where('password', '==', password)
                .limit(1)
            ).get().pipe(
                first(),
                switchMap(results => iif(() => results.docs?.length > 0, of(results.docs[0]), throwError('לא נמצא משתמש עבור פרטי ההתחברות שהוזנו'))),
                map(doc => {
                    const result = <User>doc.data();
                    result.uid = doc.id;
                    return result;
                }),
                tap(user => this.storageService.setItem('user', JSON.stringify(user))),
                catchError(error => {
                    throw new Error(error);
                })
        );
    }

    putUser(user: User): Promise<User> {
        const uid = user.uid ?? this.db.createId();
        const userWithUID = {...user, uid} as User;

        return this.db
            .collection(`users`)
            .doc(uid)
            .set(userWithUID)
            .then(() => this.afterPutUser(userWithUID))
            .then(() => { return userWithUID });
    }

    private afterPutUser(user: User): void {
        let users = [] as User[];
        const usersStorage = this.storageService.getItem('users');
        if (usersStorage) {
            users = JSON.parse(this.storageService.getItem('users'));
            let index = users.findIndex((d: User) => d.uid === user.uid);
            if (index > -1) {
                users[index] = user;
            }
            else {
                users.push(user);
            }
        }
        else {
            users.push(user);
        }
        
        this.storageService.setItem('user', JSON.stringify(user));
        this.storageService.setItem('users', JSON.stringify(users));
    }

    putIncident(incident: Incident, isNew: boolean): Promise<Incident> {
        const uid = isNew ? this.db.createId(): incident.uid;
        const incidentWithUID = {...incident, uid} as Incident;

        if (isNew) {
            return this.db
                .collection(`incidents`)
                .doc(uid)
                .set(incidentWithUID)
                .then(() => this.afterPutIncident(incidentWithUID))
                .then(() => { return incidentWithUID });
        }
            
        return this.db
            .collection(`incidents`)
            .doc(uid)
            .update(incident)
            .then(() => this.afterPutIncident(incidentWithUID))
            .then(() => { return incidentWithUID });
    }

    isIncidentExist(uid: string): Promise<boolean> {
        return this.db
            .collection(`incidents`)
            .doc(uid)
            .get()
            .toPromise()
            .then(incident => { return incident.exists });
    }

    private afterPutIncident(incident: Incident): void {
        let incidents = [] as Incident[];
        const incidentsStorage = this.storageService.getItem('incidents');
        if (incidentsStorage) {
            incidents = JSON.parse(this.storageService.getItem('incidents'));
            let index = incidents.findIndex((d: Incident) => d.uid === incident.uid);
            if (index > -1) {
                incidents[index] = incident;
            }
            else {
                incidents.push(incident);
            }
        }
        else {
            incidents.push(incident);
        }
        
        this.storageService.setItem('incidents', JSON.stringify(incidents));
    }

    getIncidents(): Observable<Incident[]> {
        return this.db.collection('incidents').get().pipe(
            first(),
            map(result => result.docs.map(doc => {
                const result = <Incident>doc.data();
                result.uid = doc.id;
                return result;
            })),
            tap(incidents => this.storageService.setItem('incidents', JSON.stringify(incidents))),
            catchError(err => of([])),
        );
    }
}