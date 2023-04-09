import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { EMPTY, from, Observable, of } from 'rxjs';

import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';
import { User } from '../model/user';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    users: User[] = [];

    constructor(
        private db: DatabaseService,
        private afAuth: AngularFireAuth,
        private router: Router,
        private alertService: AlertService
    ) { }

    login(username: string, password: string): void {
        of(this.afAuth.signOut()).pipe(
            switchMap(() => this.db.login(username, password)),
            first(),
            tap(res => {
                if (!res) {
                    this.alertService.ok('שגיאת התחברות', 'לא נמצא משתמש עבור הפרטים שהוזנו');
                }
            }),
            filter(res => !!res),
            map(user => this.signInWithFireAuth(user.email, user.password)),
            map(() => this.router.navigate(['incidents'])),
            catchError(err => {
                console.log(err);
                this.alertService.httpError(err);
                return EMPTY;
            })
        ).subscribe();
    }

    register(username: string, password: string, name: string, email: string): void {
        of(this.afAuth.signOut()).pipe(
            switchMap(() => this.signInWithFireAuth(email, password, true)),
            filter(res => !!res),
            switchMap(uid => this.db.putUser({uid, username, password, name, email} as User)),
            map(() => this.router.navigate(['incidents'])),
        ).subscribe();
    }

    private signInWithFireAuth(email: string, password: string, register?: boolean): Observable<string | undefined> {
        if (register) {
            return from(this.afAuth.createUserWithEmailAndPassword(email, password)).pipe(
                tap(() => from(this.afAuth.signInWithEmailAndPassword(email, password))),
                map(user => user.user?.uid),
                catchError(err => {
                    console.log(err);
                    if (err?.code === 'auth/email-already-in-use') {
                        this.alertService.ok('התרחשה שגיאה בעת ההרשמה למערכת', 'העובד כבר רשום למערכת');
                    }
                    else {
                        this.alertService.httpError(err);
                    }
                    return of(undefined);
                })
            );
        }

        return from(this.afAuth.signInWithEmailAndPassword(email, password)).pipe(
            map(user => user.user?.uid),
            catchError(err => {
                console.log(err);
                this.alertService.httpError(err);
                return of(undefined);
            })
        );
    }

    logout(error?: HttpErrorResponse | undefined) {
        if (error != undefined) {
            this.alertService.httpError(error);
        }

        this.afAuth.signOut().then(() => {
            sessionStorage.clear();
            this.router.navigate(['login']);
        });
    }
}