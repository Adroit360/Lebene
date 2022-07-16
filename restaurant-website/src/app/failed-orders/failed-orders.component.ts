import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { OrderDetailsAdmin } from '../models/interface';
import { OrderType } from '../single-order/single-order.component';

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
    0
  ).setHours(23, 59, 59, 999);

  constructor(private firestore: AngularFirestore) {
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
    return this.firestore
      .collection('orders', (orders) =>
        orders
          .where('date', '>=', this.startDate.getTime().toString())
          .where('date', '<=', this.endDate.toString())
          .where('completed', '==', false)
          .where('orderPaid', '==', false)
          .orderBy('date', 'desc')
      )
      .valueChanges({ idField: 'Id' });
  }

  onOrderDelivered(id: string, orderId: string): void {
    if (window.confirm(`Are you sure you want to comfirm oder: ${orderId}?`)) {
      this.updateOrder(id, { completed: true })
        // .then((res) => console.log(res))
        .catch((err) => console.log(err));
      this.success = true;
    }
  }

  onCancelOrder(id: string, orderId: string) {
    if (window.confirm(`Do you really want to delete oder: ${orderId}?`)) {
      this.deleteOrder(id)
        // .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
  }

  updateOrder(id: string, data: { completed: boolean }): Promise<void> {
    return this.firestore.collection('orders').doc(id).update(data);
  }

  deleteOrder(id: string): Promise<void> {
    return this.firestore.collection('orders').doc(id).delete();
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
