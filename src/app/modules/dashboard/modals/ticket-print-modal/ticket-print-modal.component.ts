import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPrintDirective, NgxPrintService } from 'ngx-print';
import moment from 'moment';
import 'moment/locale/es';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-ticket-print-modal',
   imports: [
    NgxPrintDirective,
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './ticket-print-modal.component.html',
  styleUrl: './ticket-print-modal.component.css'
})
export class TicketPrintModalComponent {
  loading: boolean = false
  // currentDate: any = moment().format('l');
  currentDate: any = moment().format('DD/MM/YYYY hh:mm:ss a');
  file: number  = 0;
  user: any;
  dataTicket: any;
  contractData: any;
  fontSize: number = 12;
  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<TicketPrintModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _printerService: NgxPrintService,
    private _AuthService: AuthService
  ) {
    moment.locale('es');
    this.user = this._AuthService.user();
    if (this.data.flag === 0) {
      this.file = 2;
      if (Object.keys(this.data.data.layaway).length > 0) {
        this.dataTicket = this.data.data;
        this.dataTicket['full'] = this.dataTicket.layaway
        this.dataTicket.full['incomeTotal'] =  this.dataTicket.layaway.incomes.reduce((a: any, b: any) => a + b.amount, 0);
      }

      if (Object.keys(this.data.data.sale).length > 0) {
        this.dataTicket = this.data.data;
        this.dataTicket['full'] = this.dataTicket.sale
        this.dataTicket.full['incomeTotal'] =  this.dataTicket.sale.incomes.reduce((a: any, b: any) => a + b.amount, 0);
      }
    }

    if (this.data.flag === 3) { 
      this.contractData = this.data.data;
      this.file = 3;
    }

    if (this.data.flag === 4) { 
      this.contractData = this.data.data;
      this.file = 4;
    }
  }

  printDiv() {
    // this._printerService.print('printDiv');
  }

  numeroALetras(num: number): string {

  const unidades = [
    '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS',
    'SIETE', 'OCHO', 'NUEVE', 'DIEZ', 'ONCE', 'DOCE',
    'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS',
    'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE', 'VEINTE'
  ];

  const especiales = [
    'VEINTE', 'VEINTIUNO', 'VEINTIDOS', 'VEINTITRES', 'VEINTICUATRO',
    'VEINTICINCO', 'VEINTISEIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'
  ];

  const decenas = [
    '', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA',
    'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
  ];

  const centenas = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS',
    'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS',
    'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
  ];

  const convertir = (n: number): string => {
    if (n === 0) return 'CERO';
    if (n <= 20) return unidades[n];

    if (n < 30) return especiales[n - 20];

    if (n < 100) {
      return decenas[Math.floor(n / 10)] +
        (n % 10 !== 0 ? ' Y ' + unidades[n % 10] : '');
    }

    if (n === 100) return 'CIEN';

    if (n < 1000) {
      return centenas[Math.floor(n / 100)] +
        (n % 100 !== 0 ? ' ' + convertir(n % 100) : '');
    }

    if (n < 1000000) {
      return (
        (Math.floor(n / 1000) === 1
          ? 'MIL'
          : convertir(Math.floor(n / 1000)) + ' MIL') +
        (n % 1000 !== 0 ? ' ' + convertir(n % 1000) : '')
      );
    }

    if (n < 1000000000000) {
      const millones = Math.floor(n / 1000000);
      const resto = n % 1000000;

      return (
        (millones === 1
          ? 'UN MILLON'
          : convertir(millones) + ' MILLONES') +
        (resto !== 0 ? ' ' + convertir(resto) : '')
      );
    }

    return '';
  };

  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  return `${convertir(entero)} PESOS ${centavos
    .toString()
    .padStart(2, '0')}/100 M.N.`.toUpperCase();
}

  formatIncomeType(value: string): string {
    if (!value) return '';

    return value
      .replace(/_/g, ' ')          
      .toLowerCase()           
      .replace(/\b\w/g, c => c.toUpperCase()); 
  }

  formatDate(date: any) {
     return moment(date)
      .locale('es')
      .format('MMMM')
      .toUpperCase();
  }
  get date() {
    return moment()
      .locale('es')
      .format('DD [DE] MMMM')
      .toUpperCase();
  }

  get time() {
    return moment().format('hh:mm A');
  }

  get day() {
  return moment().format('DD');
  }

  get month() {
    return moment().format('MMMM').toUpperCase();
  }

  get year() {
    return moment().format('YYYY');
  }

  get contractInventory() {
    const c = this.contractData?.car?.checks || {};

    return [
      {
        exterior: 'UNIDAD DE LUCES',
        exterior_yes: !!c.unidad_luces,
        exterior_no: !c.unidad_luces,

        interior: 'INSTRUMENTOS TABLERO',
        interior_yes: !!c.instrumentos_tablero,
        interior_no: !c.instrumentos_tablero,

        accessory: 'GATO',
        accessory_yes: !!c.gato,
        accessory_no: !c.gato
      },
      {
        exterior: 'CUARTOS DE LUCES',
        exterior_yes: !!c.cuarto_luces,
        exterior_no: !c.cuarto_luces,

        interior: 'AIRE ACONDICIONADO',
        interior_yes: !!c.aire_acondicionado,
        interior_no: !c.aire_acondicionado,

        accessory: 'MANERAL DE GATO',
        accessory_yes: !!c.maneral_gato,
        accessory_no: !c.maneral_gato
      },
      {
        exterior: 'ANTENA',
        exterior_yes: !!c.antena,
        exterior_no: !c.antena,

        interior: 'LIMPIADORES',
        interior_yes: !!c.limpiadores,
        interior_no: !c.limpiadores,

        accessory: 'LLAVE DE RUEDAS',
        accessory_yes: !!c.llave_ruedas,
        accessory_no: !c.llave_ruedas
      },
      {
        exterior: 'ESPEJOS LATERALES',
        exterior_yes: !!c.espejos_laterales,
        exterior_no: !c.espejos_laterales,

        interior: 'RADIO ESTEREO',
        interior_yes: !!c.radio_estereo,
        interior_no: !c.radio_estereo,

        accessory: 'HERRAMIENTAS',
        accessory_yes: !!c.herramientas,
        accessory_no: !c.herramientas
      },
      {
        exterior: 'CRISTALES',
        exterior_yes: !!c.cristales,
        exterior_no: !c.cristales,

        interior: 'ENCENDEDOR',
        interior_yes: !!c.encendedor,
        interior_no: !c.encendedor,

        accessory: 'TRIANGULO SEGURIDAD',
        accessory_yes: !!c.traing_seguridad,
        accessory_no: !c.traing_seguridad
      },
      {
        exterior: 'EMBLEMAS',
        exterior_yes: !!c.emblemas,
        exterior_no: !c.emblemas,

        interior: 'ESPEJO RETROVISOR',
        interior_yes: !!c.espejo_retrovisor,
        interior_no: !c.espejo_retrovisor,

        accessory: 'LLANTA REFACCION',
        accessory_yes: !!c.llanta_refaccion,
        accessory_no: !c.llanta_refaccion
      },
      {
        exterior: 'LLANTAS',
        exterior_yes: !!c.llantas,
        exterior_no: !c.llantas,

        interior: 'CENICEROS',
        interior_yes: !!c.ceniceros,
        interior_no: !c.ceniceros,

        accessory: 'EXTINGUIDOR',
        accessory_yes: !!c.extinguidor,
        accessory_no: !c.extinguidor
      },
      {
        exterior: 'MOLDURAS COMPLETAS',
        exterior_yes: !!c.molduras_completas,
        exterior_no: !c.molduras_completas,

        interior: 'MANIJAS INTERIORES',
        interior_yes: !!c.manijas_interiores,
        interior_no: !c.manijas_interiores,

        accessory: 'CLAXON',
        accessory_yes: !!c.claxon,
        accessory_no: !c.claxon
      },
      {
        exterior: 'TAPON GASOLINA',
        exterior_yes: !!c.tapones_gasolina,
        exterior_no: !c.tapones_gasolina,

        interior: 'TAPETES',
        interior_yes: !!c.tapetes,
        interior_no: !c.tapetes,

        accessory: 'TAPON ACEITE',
        accessory_yes: !!c.tapon_aceite,
        accessory_no: !c.tapon_aceite
      },
      {
        exterior: 'CARROCERIA SIN GOLPES',
        exterior_yes: !!c.carroceria_sin_golpes,
        exterior_no: !c.carroceria_sin_golpes,

        interior: 'VESTIDURAS',
        interior_yes: !!c.vestiduras,
        interior_no: !c.vestiduras,

        accessory: 'TAPON RADIADOR',
        accessory_yes: !!c.tapon_radiador,
        accessory_no: !c.tapon_radiador
      },
      {
        exterior: 'RINES CROMADOS',
        exterior_yes: !!c.tapones_ruedas_rines_cromados,
        exterior_no: !c.tapones_ruedas_rines_cromados,

        interior: 'BOTONES INTERIORES',
        interior_yes: !!c.botones_interiores,
        interior_no: !c.botones_interiores,

        accessory: 'BATERIA',
        accessory_yes: !!c.bateria,
        accessory_no: !c.bateria
      },
      {
        exterior: '',
        exterior_yes: false,
        exterior_no: false,

        interior: '',
        interior_yes: false,
        interior_no: false,

        accessory: 'FILTRO ACEITE',
        accessory_yes: !!c.filtro_aceite,
        accessory_no: !c.filtro_aceite
      },
      {
        exterior: '',
        exterior_yes: false,
        exterior_no: false,

        interior: '',
        interior_yes: false,
        interior_no: false,

        accessory: 'FILTRO AIRE',
        accessory_yes: !!c.filtro_aire,
        accessory_no: !c.filtro_aire
      }
    ];
  }

  adeudo(installments_data: any) {
    return installments_data.reduce((a: any, b: any) => a + b.amount, 0);
  }

}
