import { Component, OnInit } from '@angular/core';
import { Pessoa } from '../../shared/models/pessoa';
import { PessoaService } from '../../shared/services/pessoa.service';
import { PaginationService } from 'ng2-pagination';
import { PMMGMessagesService } from 'pmmg-messages';
import {TranslateService} from 'ng2-translate';

@Component({
  selector: 'app-pessoa-search',
  templateUrl: './pessoa-search.component.html',
  styleUrls: ['./pessoa-search.component.css']
})
export class PessoaSearchComponent implements OnInit {

  pessoas = Array<Pessoa>();

  rg: string;
  nome: string;
  page: number = 1;
  total: number = 0;
  loading: boolean;
  itemsPerPage: number = 20;

  constructor(
    private _pessoaService: PessoaService,
    private paginationService: PaginationService,
    private _pmmgMessagesService: PMMGMessagesService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

  pesquisar(page: number) {
    this.page = page;

    if (!!this.rg || !!this.nome) {
      this.loading = true;
      this._pessoaService.pesquisar(this.rg, this.nome.toUpperCase(), this.page, this.itemsPerPage, this.total)
        .subscribe(results => {
        if (results.total > 0) {
          this.pessoas = results.pessoas;
          this.loading = false;
          this.total = results.total;
        }else {
          this.translate.get('MSG.nenhum.registro.encontrado')
          .subscribe((res: string) => {this._pmmgMessagesService.show(res, { cssClass: 'msg de ok' })});
        }
        });
    } else {
      this.translate.get('MSG.campos.obrigatorios').subscribe((res: string) => {
        this._pmmgMessagesService.show(res, { cssClass: 'msg de erro' });
      });
    }

  }

  getPage(page: number) {
    this.pesquisar(page);
  }

  filtrar(page: number) {
    this.total = 0;
    this.pesquisar(page);
  }
}
