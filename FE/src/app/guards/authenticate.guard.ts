import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authenticateGuard: CanActivateFn = (route, state) => {
  const router:Router = inject(Router);
  const token: string|null = localStorage.getItem('jwtkn');
  if(token === null) {
    return router.parseUrl('auth');
  }
  return true;
};
