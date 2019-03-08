import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Headers, Response, Http, RequestOptions } from '@angular/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class CidadeService {

  private urlCidade: string = environment.domain_ambiente + '/exemplobackend/cidade';

  private urlGetCidadePorEstado = this.urlCidade + '/recuperaCidadesPorEstado/:ESTADO_ID';

  private urlGetCidadePorNome = this.urlCidade + '/recuperaCidadesPorNome/:NOME';

  constructor(private http: Http) { }


  getCidadePorEstado(estadoId: number): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });
    let url = this.urlGetCidadePorEstado.replace(':ESTADO_ID', estadoId.toString());
    return this.http.get(url, options).map(this.extractData).catch(this.handleError);
  }

  getCidadePorNome(nome: string): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });

    let url = this.urlGetCidadePorNome.replace(':NOME', nome);

    return this.http.get(url, options).map(this.extractData).catch(this.handleError)
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
