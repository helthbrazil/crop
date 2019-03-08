import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';


import { AuthGuard } from './shared/guards/auth.guard';
import { UsuarioService } from './shared/services/usuario.service';
import { AppRoutingModule } from './app-routing.module';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

import { PessoaDetailComponent } from './pessoa/pessoa-detail/pessoa-detail.component';
import { PessoaSearchComponent } from './pessoa/pessoa-search/pessoa-search.component';
import { PessoaService } from './shared/services/pessoa.service';
import { EstadoService } from './shared/services/estado.service';
import { CidadeService } from './shared/services/cidade.service';
import { EnumsService } from './shared/services/enums.service';
import { TextMaskModule } from 'angular2-text-mask';
import { Ng2PaginationModule } from 'ng2-pagination';
import { PMMGMessagesModule } from 'pmmg-messages';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from 'ng2-translate';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CalendarioComponent } from './shared/components/calendario/calendario.component';
import { MyDatePickerModule } from 'mydatepicker';
import { FileUploadModule } from 'ng2-file-upload';
import { EnviarFotosComponent } from './fotos/enviar-fotos/enviar-fotos.component';
import { ImageCropperModule } from 'ngx-image-cropper';

import { Ng2ImgToolsService, ImgResizeExactService, ImgCropService } from 'ng2-img-tools';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { Ng2ImgMaxService, ImgMaxSizeService, ImgExifService, ImgMaxPXSizeService } from 'ng2-img-max';
import { Ng2PicaService } from 'ng2-pica';
import { OpenCVOptions, NgOpenCVModule } from 'ng-open-cv';
import { NgxCropperJsModule } from 'ngx-cropperjs-wrapper';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
const openCVConfig: OpenCVOptions = {
  scriptUrl: `assets/opencv/opencv.js`,
  wasmBinaryFile: 'wasm/opencv_js.wasm',
  usingWasm: true
};

@NgModule({
  declarations: [
    AppComponent,
    UnauthorizedComponent,
    PessoaDetailComponent,
    CalendarioComponent,
    PessoaSearchComponent,
    EnviarFotosComponent
  ],
  imports: [
    FileUploadModule,
    BrowserModule,
    MyDatePickerModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    PMMGMessagesModule,
    Ng2ImgMaxModule,
    NgOpenCVModule.forRoot(openCVConfig),
    TextMaskModule,
    ImageCropperModule,
    Ng2PaginationModule,
    NgxCropperJsModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [HttpClient]
    })
  ],
  providers: [
    AuthGuard,
    UsuarioService,
    PessoaService,
    EstadoService,
    CidadeService,
    EnumsService,
    Ng2ImgToolsService, ImgResizeExactService, Ng2ImgMaxService,
    ImgMaxSizeService, ImgMaxPXSizeService, ImgExifService, Ng2PicaService,
    ImgCropService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
