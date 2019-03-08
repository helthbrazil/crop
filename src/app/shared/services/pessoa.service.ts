import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Pessoa } from '../models/pessoa';
import { environment } from '../../../environments/environment';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { ResponseContentType} from '@angular/http';

@Injectable()
export class PessoaService {

  private urlPessoa: string = environment.domain_ambiente + '/exemplobackend/pessoa/save';
  private urlExcluir: string = environment.domain_ambiente + '/exemplobackend/pessoa/excluir';
  private urlPesquisar: string = environment.domain_ambiente + '/exemplobackend/pessoa/pesquisar';
  private urlPessoaId: string = environment.domain_ambiente + '/exemplobackend/pessoa/buscarPorId/:PESSOA_ID';
  private urlDownloadArquivo: string = environment.domain_ambiente + '/exemplobackend/pessoa/downloadFile';

  constructor(private http: Http, private router: Router) { }

  salvar(p: Pessoa) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this.urlPessoa, JSON.stringify(p),
      options).map(this.extractData).catch(this.handleError);
  }

  excluir(p: Pessoa) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });
    return this.http.delete(this.urlExcluir + '/' + p.id,
      options).map(this.extractData).catch(this.handleError);
  }

  pesquisar(rg: String, nome: string, page: number, itemsPerPage: number, total: number) {
    let pes: Pessoa = new Pessoa();

    let parametros = '';
    if (rg != null && rg !== undefined) {
      pes.registroGeral = rg;
    }
    if (nome != null && nome !== undefined) {
      pes.nome = nome;
    }

    let jsonPost = {
      'pessoa': pes,
      'page': page,
      'itemsPerPage': itemsPerPage,
      'total': total

    }

    let url = this.urlPesquisar + parametros;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });

    return this.http.post(url, jsonPost,
      options).map(this.extractData).catch(this.handleError);
  }

  buscaPorId(id: number) {
    let url = this.urlPessoaId.replace(':PESSOA_ID', id.toString());
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(url, options).map(this.extractData).catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    if (error.status === 401) {
      document.location.href = environment.domain + '/autenticacaosso/login.jsf';
    } else if (error.status === 403) {
      document.location.href = environment.context + '/#/unauthorized';
    }
    return Promise.reject(error.message || error);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body;
  }

   baixarArquivo(nomeAnexo: String) {
    let url = this.urlDownloadArquivo;
    let header = new Headers();
    header.append('Content-Type', 'application/json');
    header.append('Authorization', Cookie.get('tokiuz'));
    return this.http.post(url, nomeAnexo,  { responseType: ResponseContentType.Blob, headers: header })
      .map((res) => {
        return new Blob([res.blob()], { type: "application/octet-stream"})
      });
  }

  /* private downloadFile(data: Response): void {
     debugger;
    let blob = new Blob([data.blob()], { type: "application/pdf" });
    let url = window.URL.createObjectURL(blob);
    window.open(url);
  }

  public showFile(filePath: string): void {

    let headers = new Headers();
    //headers.append('Content-Type', 'application/json');
    headers.append('Authorization', Cookie.get('tokiuz'));
    let options = new RequestOptions({ headers: headers });

    this.http
      .post(this.urlDownloadArquivo, filePath, options)
      .subscribe(
        data => {console.log(data);this.downloadFile(data)},
        error => alert("Error downloading file!"),
        () => console.log("OK!")
      );
  }*/

   
}
