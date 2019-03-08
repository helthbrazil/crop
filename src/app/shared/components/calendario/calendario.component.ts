import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

import { IMyOptions, IMyDateModel, IMyDate } from 'mydatepicker';

@Component({
  selector: 'calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

  @Input() periodo: String = '';

  @Output() alterouData = new EventEmitter();

  @Input() tamanhoCampo = '135px';

  @Input() exibirExcluirData = true;

  @Input() data: Object;

  public myDatePickerOptions: IMyOptions = {
    dateFormat: 'dd/mm/yyyy',
    dayLabels: {su: 'Dom', mo: 'Seg', tu: 'Ter', we: 'Qua', th: 'Qui', fr: 'Sex', sa: 'Sab'},
    monthLabels: { 1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun', 7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez' },
    todayBtnTxt: 'Hoje',
    width: this.tamanhoCampo,
    height: '24px',
    selectionTxtFontSize: '14px',
    inline: false,
    editableDateField: false,
    openSelectorOnInputClick: true,
    showClearDateBtn: this.exibirExcluirData
  };

  onDateChanged(event: IMyDateModel) {
    this.alterouData.emit({novaData: event.formatted, periodo: this.periodo, dataJson: event.jsdate});
  }

  constructor() { }

  ngOnInit() {
    this.myDatePickerOptions.width = this.tamanhoCampo;
    this.myDatePickerOptions.showClearDateBtn = this.exibirExcluirData;
  }
}
