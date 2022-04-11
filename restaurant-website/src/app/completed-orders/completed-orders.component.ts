import { OrderDetailsAdmin } from './../models/interface';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { OrderType } from '../single-order/single-order.component';

@Component({
  selector: 'app-completed-orders',
  templateUrl: './completed-orders.component.html',
  styleUrls: ['./completed-orders.component.scss'],
})
export class CompletedOrdersComponent implements OnInit {
  item$: Observable<OrderDetailsAdmin[]>;
  OrderType = OrderType;
  numberArray: { name: string; phoneNumber: string }[] = [];
  totalAmount = 0;
  startDate = new Date('3/1/2022');
  endDate = new Date('3/28/2022').setHours(23, 59, 59, 999);
  totalCount = 0;
  constructor(private firestore: AngularFirestore) {
    this.item$ = this.GetCompletedOrdersCollection();
    // this.item$.subscribe((items) => {
    //   // items.forEach((item) => (TotalAmount += parseFloat(item.amount)));
    //   // console.log('total : ', TotalAmount);
    //   items.forEach((item) => {
    //     if (
    //       parseInt(item.date) >= this.startDate.getTime() &&
    //       parseInt(item.date) <= this.endDate
    //     ) {
    //       this.totalAmount += parseFloat(item.amount);
    //       this.totalCount += 1;
    //     }
    //   });
    //   console.log({
    //     totalAmount: this.totalAmount,
    //     totalCount: this.totalCount,
    //   });
    // });
  }

  ngOnInit(): void {
    // this.firestore
    //   .collection('orders', (orders) => orders.where('completed', '==', true))
    //   .valueChanges()
    //   .subscribe((res) => console.log(res));
  }

  GetCompletedOrdersCollection(): Observable<any> {
    return this.firestore
      .collection('orders', (orders) =>
        orders.where('completed', '==', true).orderBy('date', 'desc')
      )
      .valueChanges({ idField: 'Id' });
  }
}
