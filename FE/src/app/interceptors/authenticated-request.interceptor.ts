import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';


export const authenticatedRequestInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const login:string = "http://localhost:8080/auth/login";
  const signup:string = "http://localhost:8080/auth/signup";
  const startUrl:string = "http://localhost:8080/officer";

  const token = localStorage.getItem('jwtkn');
  if(req.url !== login && req.url !== signup && !req.url.startsWith(startUrl)) {
    const authReq = req.clone({ headers: req.headers.set('Authorization', "Bearer " + token) });
    return next(authReq)
  } 
  else {
    return next(req);
  }
  
};
