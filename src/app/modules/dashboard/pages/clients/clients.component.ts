import { Component } from '@angular/core';
import { CLIENTS, clientsHeader } from 'src/app/core/constants/client';
import { Clients } from 'src/app/core/models/clients.model';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientsModalComponent } from '../../modals/clients-modal/clients-modal.component';

@Component({
  selector: 'app-clients',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent {
  clients: Clients[] = [];
  clientsHeader: string[] = [];
  constructor(
    private _MatDialog: MatDialog
  ) {
    this.clients = CLIENTS
    this.clientsHeader = clientsHeader
  }

  openModal() {
    this._MatDialog.open(ClientsModalComponent, {
       panelClass: 'custom-dialog-container' 
    });
  }
}
