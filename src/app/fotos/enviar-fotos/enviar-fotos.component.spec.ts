import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnviarFotosComponent } from './enviar-fotos.component';

describe('EnviarFotosComponent', () => {
  let component: EnviarFotosComponent;
  let fixture: ComponentFixture<EnviarFotosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnviarFotosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnviarFotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
