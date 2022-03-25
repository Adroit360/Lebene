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
  constructor(private firestore: AngularFirestore) {
    this.item$ = this.GetCompletedOrdersCollection();
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
    //   console.log({ numbers: this.numberArray });
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
