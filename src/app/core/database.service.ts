import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { iif, Observable, of, throwError } from 'rxjs';

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

    getUser(uid: string): User | undefined {
        const users: User[] = JSON.parse(this.sessionStorageService.getItem('users'));
        return users.find(u => u.uid === uid);
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

    removeUser(user: User): Promise<any> {
        return this.db
            .collection(`users`)
            .doc(user.uid)
            .delete()
            .then(() => {
                let users = JSON.parse(this.sessionStorageService.getItem('users')) ?? [];
                users = users.filter((d: User) => d.uid !== user.uid);
                this.sessionStorageService.setItem('users', JSON.stringify(users));
            })
    }

    getCitiesJSON(): Observable<any> {
        return this.http.get("./assets/israel-cities.json");
    }

    getStreetsJSON(): Observable<any> {
        return this.http.get("./assets/israel-streets.json");
    }
}