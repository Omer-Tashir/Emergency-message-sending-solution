import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { iif, Observable, of, throwError } from 'rxjs';

import { SessionStorageService } from '../core/session-storage-service';
import { User } from '../model/user';
import { Incident } from '../model/incident';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {

    constructor(
        private http: HttpClient,
        private db: AngularFirestore,
        private sessionStorageService: SessionStorageService
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
                tap(user => this.sessionStorageService.setItem('user', JSON.stringify(user))),
                catchError(error => {
                    throw new Error(error);
                })
        );
    }

    putUser(user: User): Promise<any> {
        return this.db
            .collection(`users`)
            .doc(user.uid)
            .set(user)
            .then(() => this.afterPutUser(user))
            .then(() => { return user });
    }

    private afterPutUser(user: User): void {
        let users = [] as User[];
        const usersStorage = this.sessionStorageService.getItem('users');
        if (usersStorage) {
            users = JSON.parse(this.sessionStorageService.getItem('users'));
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
        
        this.sessionStorageService.setItem('user', JSON.stringify(user));
        this.sessionStorageService.setItem('users', JSON.stringify(users));
    }

    getIncidents(): Observable<Incident[]> {
        return this.db.collection('incidents').get().pipe(
            first(),
            map(result => result.docs.map(doc => {
                const result = <Incident>doc.data();
                result.uid = doc.id;
                return result;
            })),
            tap(incidents => this.sessionStorageService.setItem('incidents', JSON.stringify(incidents))),
            catchError(err => of([])),
        );
    }

    getCitiesJSON(): Observable<any> {
        return this.http.get("./assets/israel-cities.json");
    }

    getStreetsJSON(): Observable<any> {
        return this.http.get("./assets/israel-streets.json");
    }
}