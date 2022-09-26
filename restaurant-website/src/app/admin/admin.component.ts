import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OrderDetailsAdmin } from '../models/interface';
import { Observable, Subscription } from 'rxjs';
import { OrderType } from '../single-order/single-order.component';
import { AuthenticationService } from '../services/authentication.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import dayjs from 'dayjs/esm';
import utc from 'dayjs/esm/plugin/utc';
dayjs.extend(utc);

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  orderStatus = false;
  closeOrder = false;
  private socket: any;
  toggleSidebar = false;
  day = new Date().getDay();
  showFailed = false;

  allOrders: OrderDetailsAdmin[] = [];
  failedOrders: OrderDetailsAdmin[] = [];
  deliveredOrders: OrderDetailsAdmin[] = [];

  currentPage = 'orders';

  orders$: Observable<OrderDetailsAdmin[]>;

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

  selected: any = {
    endDate: dayjs(this.endDate) as any,
    startDate: dayjs(this.startDate) as any,
  };

  paidOrders!: OrderDetailsAdmin[];

  OrderType = OrderType;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private firestore: AngularFirestore
  ) {
    this.socket = io('https://restaurant-payment-backend.herokuapp.com/');
    this.showFailed = activatedRoute.snapshot.queryParams['showFailed'];

    this.orders$ = this.onGetTotalOrdersCollection(
      this.startDate,
      this.endDate
    );
    let itemSubs = this.orders$.subscribe((res) => {
      if (!this.isFirstTime && res.length > this.itemLength)
        this.notificationAudio.play();
      else this.isFirstTime = false;

      this.itemLength = res.length;
    });

    // get the total orders and total amount
    this.orders$.subscribe((items) => {
      this.onCalculateOrders(items);
    });

    this.subscriptions.push(itemSubs);
  }

  ngOnInit(): void {
    let authUserstring = localStorage.getItem('authUser');
    if (authUserstring) {
      let authUser = JSON.parse(authUserstring);
      this.showOrderDetails = authUser.isAdmin;
    }

    this.http
      .get('https://restaurant-payment-backend.herokuapp.com/')
      .subscribe((res: any) => {
        this.orderStatus = res.orderStatus;
        if (this.orderStatus || this.day === 0) {
          this.closeOrder = true;
        }
      });

    this.socket.on('orderStatus', (res: { orderStatus: boolean }) => {
      this.orderStatus = res.orderStatus;
      if (res.orderStatus) {
        this.closeOrder = true;
      } else {
        this.closeOrder = false;
      }
    });
  }

  onGetTotalOrdersCollection(
    startDate: Date,
    endDate: number
  ): Observable<any> {
    return this.firestore
      .collection('orders', (orders) =>
        orders
          .where('date', '>=', startDate.getTime().toString())
          .where('date', '<=', endDate.toString())
          .orderBy('date', 'desc')
      )
      .valueChanges({ idField: 'Id' });
  }

  logOut(): void {
    this.authService
      .logOut()
      .then((res) => {
        this.router.navigate(['/login']);
      })
      .catch((err) => console.log(err));
  }

  onOpenOrders() {
    if (this.day === 0) {
      return;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    this.http
      .post(
        'https://restaurant-payment-backend.herokuapp.com/api/openOrders',
        {},
        httpOptions
      )
      .subscribe();
    this.onToggleSidebar();
  }

  onCloseOrders() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    this.http
      .post(
        'https://restaurant-payment-backend.herokuapp.com/api/closeOrders',
        {},
        httpOptions
      )
      .subscribe();
    this.onToggleSidebar();
  }

  onShowSideBar() {
    if (window.innerWidth <= 800) {
      this.toggleSidebar = !this.toggleSidebar;
    } else {
      this.toggleSidebar = false;
    }
  }
  onToggleSidebar(page?: string) {
    this.toggleSidebar = false;
    if (page) {
      this.currentPage = page;
    }
  }

  onDateChanged(event: any) {
    const { endDate, startDate } = this.selected;
    this.orders$ = this.onGetTotalOrdersCollection(
      startDate.$d,
      new Date(endDate.$d).setHours(23, 59, 59, 999)
    );

    this.orders$.subscribe((items) => {
      this.onCalculateOrders(items);
    });
  }

  onCalculateOrders(items: any) {
    this.totalAmount = 0;
    this.totalOrders = 0;
    this.foodOrdered = [];
    this.deliveredOrders = [];
    this.failedOrders = [];
    items.forEach((item: any) => {
      if (item.orderPaid) {
        if (!item.completed) {
          this.foodOrdered.push(item);
        } else {
          this.deliveredOrders.push(item);
        }
        this.totalAmount += parseFloat(item.priceOfFood);
        this.totalOrders += 1;
      } else {
        this.failedOrders.push(item);
      }
    });
    this.amountTobePayed = +(this.totalAmount * 0.86).toFixed(2); // calculate 14% of the total food revenue
  }
}
