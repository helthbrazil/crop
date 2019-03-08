import { TestBed, inject } from '@angular/core/testing';

import { ImagemService } from './imagem.service';

describe('ImagemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImagemService]
    });
  });

  it('should be created', inject([ImagemService], (service: ImagemService) => {
    expect(service).toBeTruthy();
  }));
});
