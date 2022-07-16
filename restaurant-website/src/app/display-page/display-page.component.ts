import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription, tap } from 'rxjs';
import { OrderDetailsAdmin } from '../models/interface';
import { OrderType } from '../single-order/single-order.component';

interface Order {
  // foodName: string;
  name: string;
  phoneNumber: string;
  location: string;
  extraComments?: string;
}

@Component({
  selector: 'app-display-page',
  templateUrl: './display-page.component.html',
  styleUrls: ['./display-page.component.scss'],
})
export class DisplayPageComponent implements OnInit {
  // orders$: Observable<OrderDetailsAdmin[]>;
  OrderType = OrderType;
  notificationAudio = new Audio('../../assets/Short-notification-sound.mp3');
  isFirstTime = true;
  showOrderDetails = false;
  itemLength: number = 0;
  subscriptions: Subscription[] = [];
  totalAmount = 0;
  totalOrders = 0;
  amountTobePayed = 0;
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).setHours(23, 59, 59, 999);
  foodOrdered: OrderDetailsAdmin[] = [];
  customers: { name: string; phoneNumber: string }[] = [];
  constructor(private firestore: AngularFirestore) {
    // this.orders$ = this.onGetTotalOrdersCollection();
    // let itemSubs = this.orders$.subscribe((res) => {
    //   if (!this.isFirstTime && res.length > this.itemLength)
    //     this.notificationAudio.play();
    //   else this.isFirstTime = false;
    //   this.itemLength = res.length;
    // });
    // get the total orders and total amount
    // this.orders$.subscribe((items) => {
    //   this.totalAmount = 0;
    //   this.totalOrders = 0;
    //   this.foodOrdered = [];
    //   items.forEach((item) => {
    //     //this.customers.push({ name: item.name, phoneNumber: item.phoneNumber });
    //     if (
    //       parseInt(item.date) >= this.startDate.getTime() &&
    //       parseInt(item.date) <= this.endDate
    //     ) {
    //       if (!item.completed) {
    //         this.foodOrdered.push(item);
    //       }
    //       this.totalAmount += parseFloat(item.priceOfFood);
    //       this.totalOrders += 1;
    //     }
    //   });
    //   this.amountTobePayed = +(this.totalAmount * 0.86).toFixed(2); // calculate 14% of the total food revenue
    // });
    // this.subscriptions.push(itemSubs);
  }

  success: boolean = false;

  ngOnInit(): void {
    let authUserstring = localStorage.getItem('authUser');
    if (authUserstring) {
      let authUser = JSON.parse(authUserstring);
      this.showOrderDetails = authUser.isAdmin;
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach((sub) => sub?.unsubscribe());
  }

  exampleGetCollection(): Observable<any> {
    return this.firestore
      .collection('orders', (orders) =>
        orders
          .where('date', '>=', this.startDate.getTime().toString())
          .where('date', '<=', this.endDate.toString())
          .where('completed', '==', false)
          .where('orderPaid', '==', true)
          .orderBy('date', 'desc')
      )
      .valueChanges({ idField: 'Id' });
  }

  onGetTotalOrdersCollection(): Observable<any> {
    return this.firestore
      .collection('orders', (orders) =>
        orders.where('orderPaid', '==', true).orderBy('date', 'desc')
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
}
