import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { iif, Observable, of, throwError } from 'rxjs';

import { StorageService } from '../core/session-storage-service';
import { Incident } from '../model/incident';
import { User } from '../model/user';
import { LoginAttempt } from '../model/login-attempt';
import { MessageTemplate } from '../model/message-template';
import { OutgoingMessage } from '../model/message';

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

    putLoginAttempt(username: string, result: boolean): Promise<LoginAttempt> {
        const uid = this.db.createId();
        const attempt = {
            uid, username, date: new Date(), success: result ? 'הצלחה' : 'כישלון'
        } as LoginAttempt;

        return this.db
            .collection(`login-attempts`)
            .doc(uid)
            .set(attempt)
            .then(() => this.afterPutLoginAttempt(attempt))
            .then(() => { return attempt });
    }

    private afterPutLoginAttempt(attempt: LoginAttempt): void {
        let attempts = [] as LoginAttempt[];
        const attemptsStorage = this.storageService.getItem('login-attempts');
        if (attemptsStorage) {
            attempts = JSON.parse(this.storageService.getItem('login-attempts'));
            let index = attempts.findIndex((d: LoginAttempt) => d.uid === attempt.uid);
            if (index > -1) {
                attempts[index] = attempt;
            }
            else {
                attempts.push(attempt);
            }
        }
        else {
            attempts.push(attempt);
        }
        
        this.storageService.setItem('login-attempts', JSON.stringify(attempts));
    }

    putOutgoingMessage(message: OutgoingMessage): Promise<OutgoingMessage> {
        const uid = this.db.createId();
        const outgoing = {
            uid, ...message, date: new Date()
        } as OutgoingMessage;

        return this.db
            .collection(`outgoing-messages`)
            .doc(uid)
            .set(outgoing)
            .then(() => this.afterPutOutgoingMessage(outgoing))
            .then(() => { return outgoing });
    }

    private afterPutOutgoingMessage(message: OutgoingMessage): void {
        let messages = [] as OutgoingMessage[];
        const messagesStorage = this.storageService.getItem('outgoing-messages');
        if (messagesStorage) {
            messages = JSON.parse(this.storageService.getItem('outgoing-messages'));
            let index = messages.findIndex((d: OutgoingMessage) => d.uid === message.uid);
            if (index > -1) {
                messages[index] = message;
            }
            else {
                messages.push(message);
            }
        }
        else {
            messages.push(message);
        }
        
        this.storageService.setItem('outgoing-messages', JSON.stringify(messages));
    }

    getUsers(): Observable<User[]> {
        return this.db.collection('users').get().pipe(
            first(),
            map(result => result.docs.map(doc => {
                const result = <User>doc.data();
                result.uid = doc.id;
                return result;
            })),
            tap(users => this.storageService.setItem('users', JSON.stringify(users))),
            catchError(err => of([])),
        );
    }

    putUser(user: User, isNew: boolean): Promise<User> {
        const uid = isNew ? this.db.createId(): user.uid;
        const userWithUID = {...user, uid} as User;

        if (isNew) {
            return this.db
                .collection(`users`)
                .doc(uid)
                .set(userWithUID)
                .then(() => this.afterPutUser(userWithUID))
                .then(() => { return userWithUID });
        }
            
        return this.db
            .collection(`users`)
            .doc(uid)
            .update(user)
            .then(() => this.afterPutUser(userWithUID))
            .then(() => { return userWithUID });
    }

    isUserExist(uid: string): Promise<boolean> {
        return this.db
            .collection(`users`)
            .doc(uid)
            .get()
            .toPromise()
            .then(user => { return user.exists });
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

    removeUser(user: User | undefined): void {
        if (user) {
            this.db.collection('users')
                .doc(user.uid)
                .delete()
                .then(() => this.afterRemoveUser(user))
        }
    }

    private afterRemoveUser(user: User): void {
        let users = [] as User[];
        const usersStorage = this.storageService.getItem('users');
        if (usersStorage) {
            users = JSON.parse(this.storageService.getItem('users'));
            users = users.filter(i => i.uid !== user.uid);
        }
        
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

    getMessageTemplates(): Observable<MessageTemplate[]> {
        return this.db.collection('message-templates').get().pipe(
            first(),
            map(result => result.docs.map(doc => {
                const result = <MessageTemplate>doc.data();
                result.uid = doc.id;
                return result;
            })),
            tap(templates => this.storageService.setItem('message-templates', JSON.stringify(templates))),
            catchError(err => of([])),
        );
    }

    removeIncident(incident: Incident | undefined): void {
        if (incident) {
            this.db.collection('incidents')
                .doc(incident.uid)
                .delete()
                .then(() => this.afterRemoveIncident(incident))
        }
    }

    private afterRemoveIncident(incident: Incident): void {
        let incidents = [] as Incident[];
        const incidentsStorage = this.storageService.getItem('incidents');
        if (incidentsStorage) {
            incidents = JSON.parse(this.storageService.getItem('incidents'));
            incidents = incidents.filter(i => i.uid !== incident.uid);
        }
        
        this.storageService.setItem('incidents', JSON.stringify(incidents));
    }
}