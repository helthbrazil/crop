import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Cookie } from 'ng2-cookies/ng2-cookies';

import { Usuario } from '../models/usuario';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import {JwtHelper} from 'angular2-jwt';

@Injectable()
export class UsuarioService {

  private urlMenuPrincipal: string = environment.domain + '/lite/seguranca/web/menuservice/menugeral?token=';
  private urlAutorizacao: string = environment.domain_pmsso + '/sso/permissaourl';
  private urlDadosUsuario: string = environment.domain_pmsso + '/sso/validasessao';

  constructor(
    private http: Http,
    private router: Router) {
  }

  jwtHelper: JwtHelper = new JwtHelper();

  carregarMenuPrincipal(token: string): Observable<any> {
    return this.http.get(this.urlMenuPrincipal.concat(token))
      .map(response => response.text())
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body || '';
  }

  isUsuarioLogado(key: String): Promise<Usuario> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this.urlDadosUsuario, key, options)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    if (error.status === 401) {
      document.location.href = environment.domain + '/autenticacaosso/login.jsf';
    } else if (error.status === 403) {
      document.location.href = environment.context + '#/unauthorized';
    }
    return Promise.reject(error.message || error);
  }

  isAuthorized(url: string): Promise<boolean> {
    return this.temPermissao(environment.context + '/' + url)
      .then(res => this.validaAutorizacao(res));
  }

  temPermissao(url: string): Promise<boolean> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(this.urlAutorizacao + '?u=' + url, options)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  validaAutorizacao(resultado: boolean): Promise<boolean> {
    if (!resultado) {
      this.router.navigate(['/unauthorized']);
      return Promise.resolve(false);
    } else {
      return Promise.resolve(true);
    }
  }

  recuperaNumeroPoliciaLogado() {
    let dados = this.jwtHelper.decodeToken(Cookie.get('tokiuz'));
    return dados.g;
  }

  recuperarInfoUsuario() {
    return this.jwtHelper.decodeToken(Cookie.get('tokiuz'));
  }
}
