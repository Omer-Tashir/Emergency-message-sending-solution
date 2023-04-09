import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, first, map, tap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';

import { SessionStorageService } from '../core/session-storage-service';
import { User } from '../model/user';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {

    constructor(
        private http: HttpClient,
        private db: AngularFirestore,
        private sessionStorageService: SessionStorageService
    ) {}

    init(): Observable<boolean> {
        return forkJoin([
            this.initUsers().pipe(first()),
        ]).pipe(
            map(results => !!results)
        );
    }

    login(username: string, password: string): Observable<User> {
        return this.db.collection(`users`, ref => ref
                .where('username', '==', username)
                .where('password', '==', password)
                .limit(1)
            ).get().pipe(
                first(),
                map(results => results.docs[0]),
                map(doc => {
                    const result = <User>doc.data();
                    result.uid = doc.id;
                    return result;
                }),
                tap(user => this.sessionStorageService.setItem('user', JSON.stringify(user)))
        );
    }

    private initUsers(): Observable<User[]> {
        if (!this.sessionStorageService.getItem('users')) {
            return this.db.collection(`users`).get().pipe(
                map(result => result.docs.map(doc => {
                    const result = <User>doc.data();
                    result.uid = doc.id;
                    return result;
                })),
                tap(result => this.sessionStorageService.setItem('users', JSON.stringify(result))),
                catchError(err => of([])),
            );
        }
        else {
            return of(JSON.parse(this.sessionStorageService.getItem('users')));
        }
    }

    getUser(uid: string): User | undefined {
        const users: User[] = JSON.parse(this.sessionStorageService.getItem('users'));
        return users.find(u => u.uid === uid);
    }

    putUser(user: User): Promise<any> {
        return this.db
            .collection(`users`)
            .doc(user.uid)
            .set(user).then(() => {
                let users = JSON.parse(this.sessionStorageService.getItem('users'));
                let index = users.findIndex((d: User) => d.uid === user.uid);
                users[index] = user;
                this.sessionStorageService.setItem('user', JSON.stringify(user));
                this.sessionStorageService.setItem('users', JSON.stringify(users));
            }).then(() => { return user });
    }

    removeUser(user: User): Promise<any> {
        return this.db
            .collection(`users`)
            .doc(user.uid)
            .delete()
            .then(() => {
                let users = JSON.parse(this.sessionStorageService.getItem('users'))?? [];
                users = users.filter((d: User) => d.uid !== user.uid);
                this.sessionStorageService.setItem('users', JSON.stringify(users));
            })
    }

    getCitiesJSON(): Observable<any> {
        let response = this.http.get("./assets/israel-cities.json");
        return response
    }

    getStreetsJSON(): Observable<any> {
        let response = this.http.get("./assets/israel-streets.json");
        return response
    }
}