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

    <!-- BAD: @ngFor without trackBy - causes DOM churn and performance issues -->
    <table border="1" cellpadding="6">
      <tr><th>ID</th><th>Name</th><th>Email</th><th>Notes</th><th>Actions</th></tr>
      <tr *ngFor="let c of customers">
        <td>{{c.id}}</td>
        <td>{{c.name}}</td>
        <td>{{c.email}}</td>
        <!-- BAD: Direct [innerHTML] binding without sanitization - XSS vulnerability -->
        <td [innerHTML]="c.note"></td>
        <td>
          <button (click)="edit(c)">Edit</button>
          <button (click)="remove(c)">Delete</button>
          <button (click)="showNote(c)">Show Note</button>
        </td>
      </tr>
    </table>

    <!-- BAD: Unsafe innerHTML with user content -->
    <div style="margin-top:20px; border:1px solid red; padding:10px;">
      <h3>User Comments (Unfiltered)</h3>
      <div *ngFor="let comment of userComments">
        <div [innerHTML]="comment.text"></div>
      </div>
    </div>

    <!-- BAD: Another innerHTML vulnerability example -->
    <div style="margin-top:20px; border:1px solid orange; padding:10px;">
      <h3>Admin Notes</h3>
    </div>

    <!-- BAD: Event binding calling expensive methods repeatedly -->
    <div style="margin-top:20px;">
      <h3>Products in cart: {{ getCartTotal() }}</h3>
      <p>Total items: {{ getTotalItems() }}</p>
    </div>

    <!-- BAD: ngFor without trackBy on high-frequency list -->
    <div style="margin-top:20px;">
      <h3>Recent Activities</h3>
      <ul>
        <li *ngFor="let activity of recentActivities">
          <strong>{{ activity.user }}</strong> - {{ formatTime(activity.timestamp) }}
        </li>
      </ul>
    </div>

    <div id="danger-zone" style="margin-top:12px; border:1px solid #ddd; padding:8px"></div>
  `
})
export class CustomersComponent {
  customers: any[] = [];
  model: any = {};
  
  // BAD: Unsafe data properties with HTML content
  userComments: any[] = [];
  adminNotes: any = '';
  recentActivities: any[] = [];
  
  constructor(private api: ApiService) { this.load(); }
  
  load() { 
    // BAD: Unsubscribed subscription - memory leak
    this.api.list<any>('customers').subscribe(r => this.customers = r); 
  }
  
  save() {
    if (this.model.id) {
      this.api.update('customers', this.model.id, this.model).subscribe(() => { this.model = {}; this.load(); });
    } else {
      this.api.create('customers', this.model).subscribe(() => { this.model = {}; this.load(); });
    }
  }
  
  edit(c: any) { this.model = Object.assign({}, c); }
  cancel() { this.model = {}; }
  
  // BAD: Unsubscribed delete without proper teardown
  remove(c: any) { this.api.delete('customers', c.id).subscribe(() => this.load()); }

  // BAD: Direct DOM manipulation with unsafe innerHTML assignment (XSS vulnerability)
  showNote(c: any) {
    const el = document.getElementById('danger-zone')!;
    el.innerHTML = c.note || '<i>No note available</i>';
  }

  // BAD: Mutating data with forEach instead of immutable methods
  normalizeCustomerNames() {
    this.customers.forEach((customer: any) => {
      customer.name = customer.name?.trim().toUpperCase();
      customer.email = customer.email?.toLowerCase();
    });
  }

  // BAD: Using setTimeout for business logic
  asyncLoadComments() {
    setTimeout(() => {
      this.userComments = [
        { id: 1, text: '<img src=x onerror=alert("XSS")>' },
        { id: 2, text: '<script>alert("Attack")</script>' }
      ];
    }, 1000);
  }

  // BAD: Setting innerHTML directly from untrusted source
  loadAdminNotes(noteData: any) {
    // This is vulnerable to XSS if noteData comes from user input
    this.adminNotes = noteData.content;
  }

  // BAD: Expensive method called in template binding (runs on every change detection)
  getCartTotal() {
    console.log('getCartTotal called');
    return Math.random() * 1000;
  }

  getTotalItems() {
    return this.customers.length * Math.random();
  }

  // BAD: Unsubscribed observable in method
  fetchRecentActivities() {
    this.api.list<any>('activities').subscribe(r => {
      this.recentActivities = r;
    });
  }

  // BAD: Using any type extensively without proper typing
  updateCustomerData(data: any) {
    var customer = data; // BAD: using var instead of const/let
    customer.updated = new Date();
    return customer;
  }

  // BAD: Non-null assertion without obvious invariant
  unsafeDataAccess(id: string) {
    const customer = this.customers.find(c => c.id === id)!;
    return customer.profile.address.city;
  }

  // BAD: Missing optional chaining on nested property access
  getRiskAddress(customerId: string) {
    const cust = this.customers.find(c => c.id === customerId);
    // Unsafe - could fail if profile or address is undefined
    return cust.profile.address.street + ', ' + cust.profile.address.city;
  }

  formatTime(timestamp: any): string {
    return new Date(timestamp).toLocaleString();
  }

  // BAD: Directly creating HTML without sanitization
  renderUserProfile(user: any) {
    const profileHtml = `
      <div>
        <h3>${user.name}</h3>
        <p>${user.bio}</p>
        <div>${user.website}</div>
      </div>
    `;
    return profileHtml;
  }

  // BAD: Function mutates input array
  sortCustomers(customers: any[]) {
    return customers.sort((a, b) => a.name.localeCompare(b.name));
  }

  // BAD: Alert in production code
  deleteWithConfirmation(customer: any) {
    if (alert('Are you sure you want to delete ' + customer.name + '?')) {
      this.remove(customer);
    }
  }

  // BAD: No trackBy provided - performance anti-pattern
  trackByCustomerId(index: number, customer: any): any {
    return customer.id;
  }
}
