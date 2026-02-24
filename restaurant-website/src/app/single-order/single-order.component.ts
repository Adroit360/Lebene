import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderDetailsAdmin } from '../models/interface';
import { OrderDataService } from '../services/order-data.service';

interface Order {
  // foodName: string;
  name: string;
  phoneNumber: string;
  location: string;
  extraComments?: string;
}

@Component({
  selector: 'app-single-order',
  templateUrl: './single-order.component.html',
  styleUrls: ['./single-order.component.scss'],
})
export class SingleOrderComponent implements OnInit {
  OrderType = OrderType;

  @Input('item') item: OrderDetailsAdmin = {} as OrderDetailsAdmin;
  @Input('orderType') orderType: OrderType = OrderType.failed;
  @Input() isAdmin = false;
  @Output() orderChanged = new EventEmitter<void>();

  constructor(private orderDataService: OrderDataService) {}

  ngOnInit(): void {}

  success: boolean = false;

  onOrderDelivered(id: string, orderId: string): void {
    if (window.confirm(`Are you sure you want to comfirm oder: ${orderId}?`)) {
      this.updateOrder(id, { completed: true }).subscribe({
        next: () => {
          this.success = true;
          this.orderChanged.emit();
        },
      });
    }
  }

  onCancelOrder(id: string, orderId: string) {
    if (window.confirm(`Do you really want to delete oder: ${orderId}?`)) {
      this.deleteOrder(id).subscribe({
        next: () => {
          this.orderChanged.emit();
        },
      });
    }
  }

  updateOrder(id: string, data: { completed: boolean }) {
    return this.orderDataService.updateOrder(id, data);
  }

  deleteOrder(id: string) {
    return this.orderDataService.deleteOrder(id);
  }
}

export enum OrderType {
  completed = 0,
  failed = 1,
  pendingOrder = 2,
}
