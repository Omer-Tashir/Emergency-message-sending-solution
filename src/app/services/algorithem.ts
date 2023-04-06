import { Injectable } from "@angular/core";
import * as moment from "moment";
import { forkJoin, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { ActiveUser } from "../model/active-user";
import { Comment } from "../model/comment";
import { Story } from "../model/story";
import { SuspiciousUser } from "../model/suspicious-user";
import { DataService } from "./data-service";

@Injectable({
    providedIn: 'root',
})
export class Algorithem {

    constructor(
        private dataService: DataService,
    ) { }

    getSuspiciousUsersPrecentege(activeUsers: ActiveUser[], users: SuspiciousUser[]): Observable<number> {
        return of(users.length && activeUsers.length ? (users.length / activeUsers.length) * 100 : 0);
    }

    getSuspiciousUsersTrend(users: SuspiciousUser[]): Observable<number> {
        return of(0);
    }
    
    getSuspiciousStoriesPrecentege(users: SuspiciousUser[], dataStartDate: Date, dataEndDate: Date): Observable<number> {
        let totalStories = 0;
        return this.dataService.getStories(moment(dataStartDate).format('YYYY-MM-DD'), moment(dataEndDate).format('YYYY-MM-DD')).pipe(
            tap((results: Story[]) => {
                totalStories = results.filter((story: Story) => moment(story.created_date)
                    .isBetween(moment(dataStartDate), moment(dataEndDate), undefined, '[]')).length
            }),
            map((results: Story[]) => results.filter(r => users.map(u => u.user_name).includes(r.user_id))),
            map((results: Story[]) => totalStories ? (results.length / totalStories) * 100 : 0),
        );
    }

    getSuspiciousCommentsPrecentege(users: SuspiciousUser[], dataStartDate: Date, dataEndDate: Date): Observable<number> {
        let totalComments = 0;
        return this.dataService.getComments(moment(dataStartDate).format('YYYY-MM-DD'), moment(dataEndDate).format('YYYY-MM-DD')).pipe(
            tap((results: Comment[]) => {
                totalComments = results.filter((comment: Comment) => moment(comment.created_date)
                    .isBetween(moment(dataStartDate), moment(dataEndDate), undefined, '[]')).length
            }),
            map((results: Comment[]) => results.filter(r => users.map(u => u.user_name).includes(r.user_id))),
            map((results: Comment[]) => totalComments ? (results.length / totalComments) * 100 : 0),
        );
    }
}