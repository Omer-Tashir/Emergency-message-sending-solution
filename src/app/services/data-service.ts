import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, tap } from "rxjs/operators";
import { Observable, of } from "rxjs";

import { User } from "../model/user";
import { Story } from "../model/story";
import { Comment } from "../model/comment";
import { StoryStartup } from "../model/story-startup";
import { CommentStartup } from "../model/comment-startup";
import { SuspiciousUser } from "../model/suspicious-user";
import { WarningNotification } from "../model/warning-notification";
import { WarningNotificationType } from "../model/warning-notification-type";
import { ActiveUser } from "../model/active-user";

@Injectable({
    providedIn: 'root',
})
export class DataService {

    constructor(
        private http: HttpClient
    ) { }

    getUsers(): Observable<User[]> {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_users.php`).pipe(
            map((result: any) => result as User[]),
        );
    }

    getComments(dataStartDate: string, dataEndDate: string): Observable<Comment[]> {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_comments.php?from=${dataStartDate}&to=${dataEndDate}`).pipe(
            map((result: any) => result as Comment[]),
        );
    }
    
    getStories(dataStartDate: string, dataEndDate: string): Observable<Story[]> {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_stories.php?from=${dataStartDate}&to=${dataEndDate}`).pipe(
                map((result: any) => result as Story[]),
            );
    }

    getCommentStartup(): Observable<CommentStartup[]> {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_comment_startup.php`).pipe(
                map((result: any) => result as CommentStartup[]),
            );
    }

    getStoryStartup(): Observable<StoryStartup[]> {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_story_startup.php`).pipe(
                map((result: any) => result as StoryStartup[]),
            );
    }

    getSuspiciousUsers(dataStartDate: string, dataEndDate: string): Observable<SuspiciousUser[]> {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_suspicious_users.php?from=${dataStartDate}&to=${dataEndDate}`).pipe(
                map((result: any) => result as SuspiciousUser[]),
            );
    }

    getActiveUsers(dataStartDate: string, dataEndDate: string): Observable<ActiveUser[]> {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_active_users.php?from=${dataStartDate}&to=${dataEndDate}`).pipe(
                map((result: any) => result as ActiveUser[]),
            );
    }

    getWarningNotifications(): Observable<WarningNotification[]> {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_warning_notifications.php`).pipe(
            map((result: any) => result as WarningNotification[])
        );
    }

    getWarningNotificationTypes(): Observable<WarningNotificationType[]> {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_warning_notification_types.php`).pipe(
            map((result: any) => result as WarningNotificationType[])
        );
    }

    getLatestDataDate() {
        return this.http.get(`http://localhost/emergency-message-sending-solution/get_last_date.php`).pipe(
            map((result: any) => result as string)
        );
    }
}