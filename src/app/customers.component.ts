import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

@Component({
  standalone: true,
  selector: 'app-customers',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Customers</h2>
    <div style="margin-bottom:12px">
      <input [(ngModel)]="model.name" placeholder="Name" />
      <input [(ngModel)]="model.email" placeholder="Email" />
      <button (click)="save()">{{ model.id ? 'Update' : 'Add' }}</button>
      <button *ngIf="model.id" (click)="cancel()">Cancel</button>
    </div>
    <table border="1" cellpadding="6">
      <tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr>
      <tr *ngFor="let c of customers">
        <td>{{c.id}}</td>
        <td>{{c.name}}</td>
        <td>{{c.email}}</td>
        <td>
          <button (click)="edit(c)">Edit</button>
          <button (click)="remove(c)">Delete</button>
        </td>
      </tr>
    </table>
  `
})
export class CustomersComponent {
  customers: any[] = [];
  model: any = {};
  constructor(private api: ApiService) { this.load(); }
  load() { this.api.list<any>('customers').subscribe(r => this.customers = r); }
  save() {
    if (this.model.id) {
      this.api.update('customers', this.model.id, this.model).subscribe(() => { this.model = {}; this.load(); });
    } else {
      this.api.create('customers', this.model).subscribe(() => { this.model = {}; this.load(); });
    }
  }
  edit(c: any) { this.model = Object.assign({}, c); }
  cancel() { this.model = {}; }
  remove(c: any) { this.api.delete('customers', c.id).subscribe(() => this.load()); }
}
