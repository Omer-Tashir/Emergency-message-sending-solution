import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';

import { StorageService } from '../core/session-storage-service';

@Injectable({
  providedIn: 'root',
})
export class isLoggedInGuard implements CanActivate {
  constructor(
    private storageService: StorageService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      !!this.storageService.getLoggedInUser() ? resolve(true) : reject();
    });
  }
}