import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class EnumsService {

  private urlEnums: string = environment.domain_ambiente + '/exemplobackend/enums/';

  constructor(private http: Http) { }

  getEnum(name: string): Promise<any> {
    let url = this.urlEnums + name;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(url, options).toPromise().then(this.extractData).catch(this.handleError);
  }

 private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    if (error.status === 401) {
      document.location.href = environment.domain + '/autenticacaosso/login.jsf';
    }else if (error.status === 403) {
        document.location.href = environment.context + '/#/unauthorized';
    }
    return Promise.reject(error.message || error);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body;
  }

}
