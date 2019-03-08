import { Component, OnInit } from '@angular/core';
import { Pessoa } from '../../shared/models/pessoa';
import { Estado } from '../../shared/models/estado';
import { Cidade } from '../../shared/models/cidade';
import { Genero } from '../../shared/models/genero';
import { PessoaService } from '../../shared/services/pessoa.service';
import { EstadoService } from '../../shared/services/estado.service';
import { CidadeService } from '../../shared/services/cidade.service';
import { EnumsService } from '../../shared/services/enums.service';
import { PMMGMessagesService } from 'pmmg-messages';
import { Observable } from 'rxjs';
import { isBoolean } from 'util';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {TranslateService} from 'ng2-translate';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { FileSelectDirective, FileDropDirective, FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../environments/environment';

const URL = environment.domain + '/exemplobackend/pessoa/upload';

@Component({
  selector: 'app-pessoa-detail',
  templateUrl: './pessoa-detail.component.html',
  styleUrls: ['./pessoa-detail.component.css']
})
export class PessoaDetailComponent implements OnInit {

  public uploader: FileUploader = new FileUploader({url: URL});

  public maskCPF = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];

  public model: Object;

  pessoaForm: FormGroup;
  pessoa: Pessoa;
  cidadeNaturalidade: Cidade;
  estadoOptions = Array<Estado>();
  cidadeOptions = Array<Cidade>();
  generoOptions = Array<Genero>();

  constructor(private _pessoaService: PessoaService,
    private _estadoService: EstadoService,
    private _cidadeService: CidadeService,
    private _enumService: EnumsService,
    private _pmmgMessagesService: PMMGMessagesService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private translate: TranslateService) {
  }

  ngOnInit() {
    this.carregaObjetos();
  }

  carregaObjetos() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.authToken = Cookie.get('tokiuz');

    this.pessoa = new Pessoa();
    this.cidadeNaturalidade = new Cidade();
    this.cidadeNaturalidade.estado = new Estado();

    let promises_array: Array<any> = [];

    promises_array.push(this._estadoService.getEstados().then(estados => this.estadoOptions = estados));
    promises_array.push(this._enumService.getEnum('genero').then(generos => this.generoOptions = generos));

    let promiseAll = Promise.all(promises_array);

    promiseAll.then(res => {

    let idPessoa = this._activatedRoute.snapshot.params['id'];

    if (idPessoa != null && idPessoa !== undefined && idPessoa > 0) {
        this._pessoaService.buscaPorId(idPessoa).subscribe(pessoa => {
        this.pessoa = pessoa;
        let data = this.converterCampoData(pessoa.dataNascimento);
        this.model = { date: { year: data.getFullYear(), month: data.getMonth() + 1, day: data.getDate() } };
        if (this.pessoa.estadoRegistroGeral != null && this.pessoa.estadoRegistroGeral !== undefined) {
          this.pessoa.estadoRegistroGeral = this.estadoOptions.find(estado => estado.id === this.pessoa.estadoRegistroGeral.id);
        }
        if (pessoa.genero != null && pessoa.genero !== undefined) {
            this.pessoa.genero = this.generoOptions.find(genero => genero.type === pessoa.genero);
        }
        if (this.pessoa.cidadeNaturalidade != null && this.pessoa.cidadeNaturalidade !== undefined) {
          this.cidadeNaturalidade = this.pessoa.cidadeNaturalidade;
        }
      });
    }
    });
  }

  converterCampoData(dateStr: string) {
    let parts = dateStr.split("-");
    return new Date(parts[1] + '/' + parts[2] + '/' + parts[0]);
  }

  salvar() {
    if (this.validadarCampos(this.pessoa)) {
      this._pessoaService.salvar(this.pessoa).subscribe(
        data => {

          if (data != null && data !== undefined && data.id != null && data.id !== undefined) {
            this.uploader.options.additionalParameter = {idPessoa: data.id};
            this.uploader.uploadAll();
          }

          this._router.navigate(['./pessoa/search']);
          this.translate.get('MSG.registro.salvo.sucesso').subscribe((res: string) => {
             this._pmmgMessagesService.show(res, { cssClass: 'msg de ok' });
           });
          return true;
        },
        error => {
           this.translate.get('MSG.falha.sistema').subscribe((res: string) => {
             this._pmmgMessagesService.show(res, { cssClass: 'msg de erro' });
           });
          console.error();
          return Observable.throw(error);
        });
    }

  }

  excluir() {
      this._pessoaService.excluir(this.pessoa).subscribe(
        data => {
          this._router.navigate(['./pessoa/excluir']);
          this.translate.get('MSG.registro.excluido.sucesso').subscribe((res: string) => {
             this._pmmgMessagesService.show(res, { cssClass: 'msg de ok' });
           });
          return true;
        },
        error => {
           this.translate.get('MSG.falha.sistema').subscribe((res: string) => {
             this._pmmgMessagesService.show(res, { cssClass: 'msg de erro' });
           });
          console.error();
          return Observable.throw(error);
        });
  }

  validadarCampos(p: Pessoa) {

    let resultado = true;
    if (p.cpf != null) {
      this.pessoa.cpf = p.cpf.replace(/[^\d]+/g, '');
    }
    if (this.cidadeNaturalidade.nome != null && this.cidadeNaturalidade.id == null) {
      this._pmmgMessagesService.show('É necessário selecionar uma cidade.', { cssClass: 'msg de erro' });
      return false;
    } else {
      if (this.cidadeNaturalidade.id != null) {
        this.pessoa.cidadeNaturalidade = this.cidadeNaturalidade;
      }
    }
    return resultado;
  }

  loadCidades() {
    if (this.cidadeNaturalidade.nome) {
      if (this.cidadeNaturalidade.nome.length > 2) {
        this._cidadeService.getCidadePorNome(this.cidadeNaturalidade.nome).subscribe(cidades => this.cidadeOptions = cidades);
      }
    }
  }

  selecionaCidade(cidade: Cidade) {
    this.pessoa.cidadeNaturalidade = cidade;
    this.cidadeNaturalidade = cidade;
    this.cidadeOptions = Array<Cidade>();
  }

  voltar() {
    this._router.navigate(['./pessoa/search']);
  }

    alterarData(event) {
      this.pessoa.dataNascimento = event.dataJson;
  }

  removerAnexo() {
    this.pessoa.caminhoAnexo = '';
    this.pessoa.nomeAnexo = '';
  }

  downloadArquivo() {
    this._pessoaService.baixarArquivo(this.pessoa.nomeAnexo).subscribe(res => {
      let link = document.createElement('a');
      document.body.appendChild(link);
      link.href = window.URL.createObjectURL(res);
      link.download = this.pessoa.nomeAnexo.toString();
      link.click();
    });
  }

}