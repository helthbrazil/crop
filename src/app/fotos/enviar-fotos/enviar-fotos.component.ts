import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ɵConsole } from '@angular/core';
import { tap, switchMap, filter } from 'rxjs/operators';
import { NgOpenCVService, OpenCVLoadResult } from 'ng-open-cv';
import { Ng2ImgToolsService } from 'ng2-img-tools';
import { Observable, forkJoin, BehaviorSubject, fromEvent, Observer } from 'rxjs';
import { Arquivo } from '../models/arquivo';
import { ArquivoImagem } from '../models/arquivoImagem';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagemService } from './imagem.service';
import { ImagemCrop } from '../models/imagemCrop';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { CropperOptions } from 'ngx-cropperjs-wrapper';

@Component({
  selector: 'app-enviar-fotos',
  templateUrl: './enviar-fotos.component.html',
  styleUrls: ['./enviar-fotos.component.css']
})
export class EnviarFotosComponent implements OnInit {
  mensagemLoading: string;
  arquivoCrop: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  // IMAGEM SELECIONADA PARA CORTE MANUAL
  arquivoSelecionado: any;

  readonly PROPORCAO_LADO = 0.8;
  readonly PROPORCAO_CIMA = 0.4;
  readonly PROPORCAO_BAIXO = 1.2;

  readonly DIMENSOES = [40, 120, 200, 600, 800];

  limiteArquivos = 50;

  showLoading = false;
  maxWidth = 800;
  maxHeight = this.maxWidth;
  private classifiersLoaded = new BehaviorSubject<boolean>(false);
  classifiersLoaded$ = this.classifiersLoaded.asObservable();

  elementosCanvas: Array<any>;
  arquivos: Array<File>;
  imagensProcessadas: Array<ArquivoImagem>

  file: any;
  imageData: any;
  imageDataAvatar: any;
  event: any;

  // Config for cropper.js (see official cropper.js repo for complete list of available options)
  public options = {
    minCropWidth: 100, // Implemented in wrapper (not supported in cropper.js)
    minCropHeight: 100, // Implemented in wrapper (not supported in cropper.js)
    movable: true,
    scalable: false,
    zoomable: false,
    viewMode: 3,
    aspectRatio: 1,
  } as CropperOptions;

  constructor(private ngOpenCVService: NgOpenCVService, private ng2ImgToolsService: Ng2ImgToolsService,
    private sanitizer: DomSanitizer, private imagemService: ImagemService) { }

  // INICIALIZA A BIBLIOTECA DE DETECÇÃO  
  ngOnInit() {
    this.elementosCanvas = new Array<any>();
    this.arquivos = new Array<File>();
    this.imagensProcessadas = new Array<ArquivoImagem>();

    this.ngOpenCVService.isReady$
      .pipe(
        filter((result: OpenCVLoadResult) => result.ready),
        switchMap(() => {
          return this.carregarClassificadores();
        })
      )
      .subscribe(() => {
        this.classifiersLoaded.next(true);
      });
  }

  ngAfterViewInit(): void { }

  /**
   * Método utilizado para ler os arquivos anexados
   * @author Hebert Ferreira
   * @param event 
   */
  lerArquivos(event) {
    this.cancelar();
    let observerRedimensionar = new Array<any>();
    let observerLoad = new Array<any>();
    let totalDeArquivos = event.target.files.length;

    if (totalDeArquivos > this.limiteArquivos) {
      alert(`O máximo de arquivos permitidos é ${this.limiteArquivos} arquivos`);
      throw 'Quantidade de arquivos excedida';
    }

    if (totalDeArquivos > 0) {
      this.showLoading = true;
      this.arquivos.length = 0;
      this.mensagemLoading = 'Padronizando tamanho das imagens';
      this.imagensProcessadas.length = 0;
      this.elementosCanvas.length = 0;
    } else {
      throw 'Não há arquivos para processar';
    }

    let arquivosRedimensionados = new Array<File>();

    for (let i = 0; i < totalDeArquivos; i++) {
      this.arquivos.push(event.target.files[i]);
      observerRedimensionar.push(this.imagemService.redimensionar(this.maxWidth, this.arquivos[i]));
    }

    // REDIMENSIONAR IMAGENS
    forkJoin(observerRedimensionar).subscribe(response => {
      console.info('imagens redimensionadas');
      response.forEach(item => {
        this.elementosCanvas.push(item);
      });

      this.elementosCanvas.forEach(elemento => {
        observerLoad.push(this.ngOpenCVService.loadImageToHTMLCanvas(elemento.dataurl, elemento.canvas));
      });

      // CARREGAR IMAGENS PARA A MEMÓRIA DO SERVIÇO DE DETECÇÃO DE FACES
      forkJoin(observerLoad).subscribe(response => {
        console.info('imagens carregadas');
        setTimeout(() => {
          this.carregarServicoDeDeteccaoFace();
        }, 100);
      });
    });

  }

  /**
   * Carregar classificadores para detecção nas imagens.
   * No caso só é carregado o classificador para detecção
   * de faces frontais.
   */
  carregarClassificadores(): Observable<any> {
    return forkJoin(
      this.ngOpenCVService.createFileFromUrl(
        'haarcascade_frontalface_default.xml',
        `assets/opencv/data/haarcascades/haarcascade_frontalface_default.xml`
      )
    );
  }

  /**
   * Método que inicializa parâmetros e dispara o serviço de busca de faces
   * @author Hebert Ferreira
   */
  carregarServicoDeDeteccaoFace() {
    this.showLoading = true;
    this.imagensProcessadas.length = 0;
    // before detecting the face we need to make sure that
    // 1. OpenCV is loaded
    // 2. The classifiers have been loaded    

    this.ngOpenCVService.isReady$
      .pipe(
        filter((result: OpenCVLoadResult) => result.ready),
        switchMap(() => {
          return this.classifiersLoaded$;
        }),
        tap(() => {
          this.buscarFaces();
        })
      )
      .subscribe(() => {
        console.log('Face detected');
      });
  }

  /**
   * Método utilizado para detectar as faces dos usuários a partir de elementos canvas pré-carregados.
   * @author Hebert Ferreira
   * 
   */
  buscarFaces() {
    console.info('Detectando faces');
    this.showLoading = true;
    this.mensagemLoading = 'Detectando faces e processando imagens';
    let observerCorteFinal = new Array<any>();

    this.elementosCanvas.forEach(item => {
      this.processarImagens(item, observerCorteFinal);
    });

    console.log('Processando imagens');

    // PROCESSANDO IMAGENS. O RESULTADO É UM ARRAY COM IMAGENS 
    // PRINCIPAIS E EM MINIATURAS
    forkJoin(observerCorteFinal).subscribe(response => {
      console.log('Imagens Processadas');
      this.showLoading = false;
      for (let i = 0; i < response.length; i++) {
        this.imagensProcessadas.push(new ArquivoImagem(response[i].id, response[i].imagemPrincipal, response[i].imagemMiniatura));
      }
    });

  }

  /**
   * 
   * Esse método é responsável pelo algoritmo de corte das imagens principais e miniaturas.
   * Retorna um objeto que possui os parâmetros necessários para corte.
   * @author Hebert Ferreira - Tenente Rafael - Thiago Lopes
   * @returns ImagemCrop    
   * @param imagemCrop 
   * @param isMiniatura 
   */
  private processarLogicaDeCorteDaImagem(imagemCrop: ImagemCrop, isMiniatura: boolean): ImagemCrop {
    // ADICIONAR ESPAÇO
    let esquerda = imagemCrop.x - imagemCrop.width * (isMiniatura ? this.PROPORCAO_CIMA : this.PROPORCAO_LADO);
    let direita = imagemCrop.x + imagemCrop.width * (1 + (isMiniatura ? this.PROPORCAO_CIMA : this.PROPORCAO_LADO));
    let acima = imagemCrop.y - imagemCrop.height * (this.PROPORCAO_CIMA);
    let abaixo = imagemCrop.y + imagemCrop.height * (1 + (isMiniatura ? this.PROPORCAO_CIMA : this.PROPORCAO_BAIXO));

    if (acima < 0) {
      esquerda = esquerda - (acima / 2);
      direita = direita + (acima / 2);
      acima = 0;
    }

    if (abaixo > imagemCrop.alturaImagemOriginal) {
      esquerda = esquerda - ((imagemCrop.alturaImagemOriginal - abaixo) / 2);
      direita = direita + ((imagemCrop.alturaImagemOriginal - abaixo) / 2);
      abaixo = imagemCrop.alturaImagemOriginal;
    }

    if (isMiniatura) {

      if (esquerda < 0) {
        acima = acima - (esquerda / 2);
        abaixo = abaixo + (esquerda / 2);
        esquerda = 0;
      }

      if (direita > imagemCrop.larguraImagemOriginal) {
        acima = acima - (imagemCrop.larguraImagemOriginal / 2);
        abaixo = abaixo + (imagemCrop.larguraImagemOriginal / 2);
        direita = imagemCrop.larguraImagemOriginal;
      }

    } else {
      if (esquerda < 0) {
        abaixo = abaixo + esquerda;
        esquerda = 0;
      }

      if (direita > imagemCrop.larguraImagemOriginal) {
        abaixo = abaixo + (imagemCrop.larguraImagemOriginal - direita);
        direita = imagemCrop.larguraImagemOriginal;
      }
    }

    // TRANSFORMAR EM INTEIROS
    esquerda = Math.floor(esquerda);
    direita = Math.floor(direita);
    acima = Math.floor(acima);
    abaixo = Math.floor(abaixo);

    imagemCrop.x = esquerda;
    imagemCrop.y = acima;
    imagemCrop.width = direita - esquerda;
    imagemCrop.height = abaixo - acima;

    return imagemCrop;
  }

  processarImagens(item: any, observerCorteFinal: Array<any>) {
    let canvas = item.canvas;
    let src;
    try {
      src = cv.imread(canvas.id);
    } catch (error) {
      console.error(canvas.id);
    }
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    const faces = new cv.RectVector();
    const faceCascade = new cv.CascadeClassifier();
    // load pre-trained classifiers, they should be in memory now
    faceCascade.load('haarcascade_frontalface_default.xml');

    // detect faces
    const msize = new cv.Size(0, 0);
    // VER LINK: https://docs.opencv.org/2.4/modules/objdetect/doc/cascade_classification.html
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
    for (let i = 0; i < faces.size(); ++i) {
      // PEGAR SOMENTE O PRIMEIRO ROSTO ENCONTRADO
      if (i == 0) {
        console.info(`Rosto encontrado [${canvas.id}]`);
        // PROCESSAR REGRA DE CORTE
        let imageCrop = new ImagemCrop(faces.get(i).width, faces.get(i).height, faces.get(i).x, faces.get(i).y);

        imageCrop.alturaImagemOriginal = item.originalHeight;
        imageCrop.larguraImagemOriginal = item.originalWidth;
        let copiaImageCrop = { ...imageCrop };
        let crop = this.processarLogicaDeCorteDaImagem(imageCrop, false);
        let cropMiniatura = this.processarLogicaDeCorteDaImagem(copiaImageCrop, true);

        if (observerCorteFinal)
          observerCorteFinal.push(this.imagemService.cortarImagem(item, crop, cropMiniatura));
      }
    }
    src.delete();
    gray.delete();
    faceCascade.delete();
    faces.delete();
  }

  excluirImagem(imagem: ArquivoImagem) {
    let index = this.imagensProcessadas.indexOf(imagem);
    if (index !== -1) {
      this.imagensProcessadas.splice(index, 1);
    }
  }


  // CROP
  cortarImagemManualmente(imagem: ArquivoImagem) {
    let arquivo = this.arquivos.find(arquivo => arquivo.name.split('.')[0] === imagem.nome);
    if (arquivo) {
      console.info(arquivo);
      this.arquivoSelecionado = arquivo;
    }

    /*    this.imagemService.fileToImage(arquivo).subscribe(response => {
         console.log(response);
         this.arquivoSelecionado = response.imagem.src;
       });; */
  }

  onFileChange(arquivo) {
    console.info(event);
    this.arquivoCrop = arquivo;
  }

  atualizarImagem() {
    let _this = this;
    let index = this.arquivos.findIndex(arq => arq.name === this.arquivoCrop.name);
    this.imagemService.blobToDataUrl(this.arquivoCrop).subscribe(response => {
      let index = _this.imagensProcessadas.findIndex(arq => arq.nome === this.arquivoCrop.name.split('.')[0]);
      _this.imagensProcessadas[index].dataURL = response;
      this.arquivoCrop = null;
      this.fecharEdicaoManual();
    });
  }

  cancelar() {
    this.imagensProcessadas.length = 0;
    this.arquivoSelecionado = null;
  }

  fecharEdicaoManual() {
    this.arquivoSelecionado = null;
  }

}
