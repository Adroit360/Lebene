import { OrderDetailsAdmin } from './../models/interface';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderType } from '../single-order/single-order.component';
import { map } from 'rxjs/operators';
import { OrderDataService } from '../services/order-data.service';

@Component({
  selector: 'app-completed-orders',
  templateUrl: './completed-orders.component.html',
  styleUrls: ['./completed-orders.component.scss'],
})
export class CompletedOrdersComponent implements OnInit {
  // item$: Observable<OrderDetailsAdmin[]>;
  OrderType = OrderType;
  numberArray: { name: string; phoneNumber: string }[] = [];
  totalAmount = 0;
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).setHours(23, 59, 59, 999);
  totalCount = 0;
  constructor(private orderDataService: OrderDataService) {
    // this.item$ = this.GetCompletedOrdersCollection();
  }

  ngOnInit(): void {}

  GetCompletedOrdersCollection(): Observable<any> {
    return this.orderDataService
      .getOrders(this.startDate.getTime(), this.endDate)
      .pipe(map((items) => items.filter((item) => item.completed)));
  }
}
