import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-action-message',
  imports: [ButtonComponent, CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './action-message.component.html',
  styleUrl: './action-message.component.css'
})
export class ActionMessageComponent {
  @Output() accept = new EventEmitter<void>();
  loading = false;
  msg?: string;
  icon?: string;
  color?: string;

  constructor(
    public ref: MatDialogRef<ActionMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.msg =  this.data.msg;
    this.icon = this.data.icon;
    this.color = this.data.color;
  }

  onAccept() { 
    this.accept.emit();
   }   

  onCancel() { 
    this.ref.close(false); 
  }
}
