/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CidadeService } from './cidade.service';

describe('CidadeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CidadeService]
    });
  });

  it('should ...', inject([CidadeService], (service: CidadeService) => {
    expect(service).toBeTruthy();
  }));
});
