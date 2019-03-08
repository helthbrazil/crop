import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Headers, Http, Response, RequestOptions } from '@angular/http';

import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario';
import { environment } from '../../../environments/environment';
import { PlatformLocation } from '@angular/common';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private http: Http,
    private usuarioService: UsuarioService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return Promise.resolve(environment.isAuthorizationMock).then(result => {
      if (result) {
        return Promise.resolve(true);
      } else {
        return this.usuarioService.isAuthorized(route.routeConfig['path']);
      }
    });
  }
}

