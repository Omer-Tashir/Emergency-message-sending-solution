import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { SessionStorageService } from '../core/session-storage-service';
import { AlertService } from '../core/alerts/alert.service';
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
        private alertService: AlertService,
        private sessionStorageService: SessionStorageService,
    ) { }

    login(username: string, password: string) {
        of(this.afAuth.signOut()).pipe(
            switchMap(() => this.db.login(username)),
            first(),
            tap(res => {
                if (!res) {
                    this.alertService.ok('שגיאת התחברות', 'לא נמצא משתמש עבור הפרטים שהוזנו');
                }
            }),
            filter(res => res),
            map(() => this.signInWithFireAuth(username, password))
        ).subscribe();
    }

    private signInWithFireAuth(username: string, password: string): void {
        this.afAuth
            .signInWithEmailAndPassword(username, password)
            .then((auth) => {
                sessionStorage.setItem('user', JSON.stringify(auth.user));

                this.db.init().pipe(first()).subscribe(() => {
                    this.users = JSON.parse(this.sessionStorageService.getItem('users'));
                    const user = this.users.find(a => a.username === username);
                    sessionStorage.setItem('user', JSON.stringify(user));

                    if (!auth.user?.displayName) {
                        auth.user?.updateProfile({
                            displayName: user?.name
                        }).then(() => {
                            this.router.navigate(['dashboard']);
                        });
                    }
                    else {
                        this.router.navigate(['dashboard']);
                    }
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