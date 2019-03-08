import { Component, OnInit, ElementRef, Renderer } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { UsuarioService } from './shared/services/usuario.service';

import { environment } from '../environments/environment';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import {TranslateService} from 'ng2-translate';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  menuHTML: any;
  loggedIn = false;
  title = 'Gestão de Fotos';

  constructor(private usuarioService: UsuarioService, private sanitizer: DomSanitizer, private translate: TranslateService) {
   this.translate.setDefaultLang('pt-BR');
   this.translate.use('pt-BR');
  }
  ngOnInit() {
    let token = this.getCookie('tokiuz');
    if (environment.isAuthorizationMock || (!!token && token !== 'null')) {
      if (!sessionStorage.getItem('menuHTML_' + token)) {
        this.usuarioService.carregarMenuPrincipal(token).
          subscribe(data => {
            this.menuHTML = this.sanitizer.bypassSecurityTrustHtml(data);
            sessionStorage.setItem('menuHTML_' + token, data);
          });
      } else {
        this.menuHTML = this.sanitizer.bypassSecurityTrustHtml(sessionStorage.getItem('menuHTML_' + token));
      }
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
      document.location.href = environment.domain + '/autenticacaosso/login.jsf';
    }
  }
  getCookie(key: string) {
    return Cookie.get(key);
  }
}