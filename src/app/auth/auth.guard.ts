import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';

import { SessionStorageService } from '../core/session-storage-service';

@Injectable({
  providedIn: 'root',
})
export class isLoggedInGuard implements CanActivate {
  constructor(
    private sessionStorageService: SessionStorageService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      !!this.sessionStorageService.getLoggedInUser() ? resolve(true) : reject();
    });
  }
}