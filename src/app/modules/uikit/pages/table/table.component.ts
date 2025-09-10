import { HttpClient } from '@angular/common/http';
import { Component, computed, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { dummyData } from 'src/app/shared/dummy/user.dummy';
import { TableActionComponent } from './components/table-action/table-action.component';
import { TableFooterComponent } from './components/table-footer/table-footer.component';
import { TableHeaderComponent } from './components/table-header/table-header.component';
import { TableRowComponent } from './components/table-row/table-row.component';
import { User } from './model/user.model';
import { TableFilterService } from './services/table-filter.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableHeaderComponent,
    TableFooterComponent,
    TableRowComponent,
    TableActionComponent,
    CommonModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit {
  
  flag : boolean = false;
  @Input() headers!: any[];
  @Input() data!: any[];
  

  dataSignal = signal<any[]>([]);
  constructor(private http: HttpClient, private filterService: TableFilterService) {
  }


  // Emiter checkbox in table header
  public toggleUsers(checked: boolean) {
    this.dataSignal.update((users) => {
      return users.map((user) => {
        return { ...user, selected: checked };
      });
    });
  }

  filteredData = computed(() => {
    const search = this.filterService.searchField().toLowerCase();
    console.log(search)
    const status = this.filterService.statusField();
    const order = this.filterService.orderField();

    console.log(search)

    return this.dataSignal()
  });

  ngOnInit() {
    this.dataSignal.set(this.data)
  }
}


/*this.http.get<User[]>('https://freetestapi.com/api/v1/users?limit=8').subscribe({
      next: (data) => this.users.set(data),
      error: (error) => {
        this.users.set(dummyData);
        this.handleRequestError(error);
      },
    });
    */