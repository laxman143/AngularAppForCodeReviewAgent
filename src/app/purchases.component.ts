import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

@Component({
  standalone: true,
  selector: 'app-purchases',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Purchases</h2>
    <div style="margin-bottom:12px">
      <input type="number" [(ngModel)]="model.customerId" placeholder="Customer ID" />
      <input type="number" [(ngModel)]="model.productId" placeholder="Product ID" />
      <input type="number" [(ngModel)]="model.quantity" placeholder="Quantity" />
      <button (click)="save()">{{ model.id ? 'Update' : 'Add' }}</button>
      <button *ngIf="model.id" (click)="cancel()">Cancel</button>
    </div>
    <table border="1" cellpadding="6">
      <tr><th>ID</th><th>Customer</th><th>Product</th><th>Quantity</th><th>Actions</th></tr>
      <tr *ngFor="let p of purchases">
        <td>{{p.id}}</td>
        <td>{{p.customerId}}</td>
        <td>{{p.productId}}</td>
        <td>{{p.quantity}}</td>
        <td>
          <button (click)="edit(p)">Edit</button>
          <button (click)="remove(p)">Delete</button>
        </td>
      </tr>
    </table>
  `
})
export class PurchasesComponent {
  purchases: any[] = [];
  model: any = {};
  constructor(private api: ApiService) { this.load(); }
  load() { this.api.list<any>('purchases').subscribe(r => this.purchases = r); }
  save() {
    if (this.model.id) {
      this.api.update('purchases', this.model.id, this.model).subscribe(() => { this.model = {}; this.load(); });
    } else {
      this.api.create('purchases', this.model).subscribe(() => { this.model = {}; this.load(); });
    }
  }
  edit(p: any) { this.model = Object.assign({}, p); }
  cancel() { this.model = {}; }
  remove(p: any) { this.api.delete('purchases', p.id).subscribe(() => this.load()); }
}
