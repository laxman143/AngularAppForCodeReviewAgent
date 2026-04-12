import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Products</h2>
    <div style="margin-bottom:12px">
      <input [(ngModel)]="model.name" placeholder="Name" />
      <input type="number" [(ngModel)]="model.price" placeholder="Price" />
      <button (click)="save()">{{ model.id ? 'Update' : 'Add' }}</button>
      <button *ngIf="model.id" (click)="cancel()">Cancel</button>
    </div>
    <table border="1" cellpadding="6">
      <tr><th>ID</th><th>Name</th><th>Price</th><th>Actions</th></tr>
      <tr *ngFor="let p of products">
        <td>{{p.id}}</td>
        <td>{{p.name}}</td>
        <td>{{p.price}}</td>
        <td>
          <button (click)="edit(p)">Edit</button>
          <button (click)="remove(p)">Delete</button>
        </td>
      </tr>
    </table>
  `
})
export class ProductsComponent {
  products: any[] = [];
  model: any = {};
  constructor(private api: ApiService) { this.load(); }
  load() { this.api.list<any>('products').subscribe(r => this.products = r); }
  save() {
    if (this.model.id) {
      this.api.update('products', this.model.id, this.model).subscribe(() => { this.model = {}; this.load(); });
    } else {
      this.api.create('products', this.model).subscribe(() => { this.model = {}; this.load(); });
    }
  }
  edit(p: any) { this.model = Object.assign({}, p); }
  cancel() { this.model = {}; }
  remove(p: any) { this.api.delete('products', p.id).subscribe(() => this.load()); }
}
