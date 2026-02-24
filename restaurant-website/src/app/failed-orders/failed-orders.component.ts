import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderDetailsAdmin } from '../models/interface';
import { OrderType } from '../single-order/single-order.component';
import { map } from 'rxjs/operators';
import { OrderDataService } from '../services/order-data.service';

@Component({
  selector: 'app-failed-orders',
  templateUrl: './failed-orders.component.html',
  styleUrls: ['./failed-orders.component.scss'],
})
export class FailedOrdersComponent implements OnInit {
  // item$: Observable<OrderDetailsAdmin[]>;
  OrderType = OrderType;
  data: any;
  numberArray: { name: string; phoneNumber: string }[] = [];
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).setHours(23, 59, 59, 999);

  constructor(private orderDataService: OrderDataService) {
    // this.item$ = this.exampleGetCollection();
    // this.item$.subscribe((items) => {
    //   let TotalAmount = 0;
    //   // items.forEach((item) => (TotalAmount += parseFloat(item.amount)));
    //   // console.log('total : ', TotalAmount);
    //   items.forEach((item) =>
    //     this.numberArray.push({
    //       name: item.name,
    //       phoneNumber: item.phoneNumber,
    //     })
    //   );
    //   console.log(this.numberArray);
    // });
  }

  success: boolean = false;

  ngOnInit(): void {}

  exampleGetCollection(): Observable<any> {
    return this.orderDataService
      .getOrders(this.startDate.getTime(), this.endDate)
      .pipe(
        map((items) =>
          items.filter((item) => !item.completed && !item.orderPaid),
        ),
      );
  }

  onOrderDelivered(id: string, orderId: string): void {
    if (window.confirm(`Are you sure you want to comfirm oder: ${orderId}?`)) {
      this.updateOrder(id, { completed: true }).subscribe({
        next: () => {
          this.success = true;
        },
        error: (err) => console.log(err),
      });
    }
  }

  onCancelOrder(id: string, orderId: string) {
    if (window.confirm(`Do you really want to delete oder: ${orderId}?`)) {
      this.deleteOrder(id).subscribe({
        error: (err) => console.log(err),
      });
    }
  }

  updateOrder(id: string, data: { completed: boolean }) {
    return this.orderDataService.updateOrder(id, data);
  }

  deleteOrder(id: string) {
    return this.orderDataService.deleteOrder(id);
  }

  onDeleteAllFailedOrders() {
    this.exampleGetCollection().subscribe((res) => {
      // console.log('Deleting....');
      // res.forEach((item: any) => {
      //   this.deleteOrder(item.Id);
      //   // console.log(item.Id);
      // });
      // console.log('Done....');
    });
  }
}
