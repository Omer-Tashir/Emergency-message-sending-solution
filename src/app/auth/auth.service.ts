import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

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
            map(user => this.signInWithFireAuth(user))
        ).subscribe();
    }

    register(username: string, password: string, name: string): void {
        of(this.afAuth.signOut()).pipe(
            switchMap(() => this.db.putUser({username, password, name} as User)),
            first(),
            map(user => this.signInWithFireAuth(user))
        ).subscribe();
    }

    private signInWithFireAuth(user: User): void {
        this.afAuth
            .signInWithCustomToken(user.uid)
            .then((auth) => {
                this.db.init().pipe(first()).subscribe(() => {
                    this.router.navigate(['dashboard']);
                });
            })
            .catch((error: any) => {
                console.log(error);
                this.alertService.httpError(error);
            });
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