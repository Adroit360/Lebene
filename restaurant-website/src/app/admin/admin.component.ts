import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OrderDetailsAdmin } from '../models/interface';
import { Subscription } from 'rxjs';
import { OrderType } from '../single-order/single-order.component';
import { AuthenticationService } from '../services/authentication.service';
import { OrderDataService } from '../services/order-data.service';
import dayjs from 'dayjs/esm';
import utc from 'dayjs/esm/plugin/utc';
dayjs.extend(utc);

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
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

  orders: OrderDetailsAdmin[] = [];

  notificationAudio = new Audio('../../assets/Short-notification-sound.mp3');
  isFirstTime = true;
  showOrderDetails = false;
  itemLength: number = 0;
  private ordersSubscription?: Subscription;
  totalAmount = 0;
  totalOrders = 0;
  amountTobePayed = 0;
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).setHours(23, 59, 59, 999);
  foodOrdered: OrderDetailsAdmin[] = [];

  selected: any = {
    endDate: dayjs(this.endDate) as any,
    startDate: dayjs(this.startDate) as any,
  };

  paidOrders!: OrderDetailsAdmin[];

  OrderType = OrderType;
  private readonly apiBaseUrl: string;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private orderDataService: OrderDataService,
  ) {
    this.apiBaseUrl = this.orderDataService.getApiBaseUrl();
    this.socket = io(this.apiBaseUrl);
    this.showFailed = activatedRoute.snapshot.queryParams['showFailed'];
  }

  ngOnInit(): void {
    let authUserstring = localStorage.getItem('authUser');
    if (authUserstring) {
      let authUser = JSON.parse(authUserstring);
      this.showOrderDetails = authUser.isAdmin;
    }

    this.http.get(`${this.apiBaseUrl}/`).subscribe((res: any) => {
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

    this.socket.on('ordersChanged', () => {
      this.loadOrders();
    });

    this.loadOrders();
  }

  loadOrders() {
    this.ordersSubscription?.unsubscribe();

    const orderSub = this.orderDataService
      .getOrders(this.startDate.getTime(), this.endDate)
      .subscribe({
        next: (res) => {
          if (!this.isFirstTime && res.length > this.itemLength) {
            this.notificationAudio.play();
          } else {
            this.isFirstTime = false;
          }

          this.itemLength = res.length;
          this.orders = res;
          this.onCalculateOrders(res);
        },
        error: (err) => {
          console.error('Failed to load admin orders', err);
          this.orders = [];
          this.foodOrdered = [];
          this.deliveredOrders = [];
          this.failedOrders = [];
        },
      });

    this.ordersSubscription = orderSub;
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
      .post(`${this.apiBaseUrl}/api/openOrders`, {}, httpOptions)
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
      .post(`${this.apiBaseUrl}/api/closeOrders`, {}, httpOptions)
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
    this.startDate = startDate.$d;
    this.endDate = new Date(endDate.$d).setHours(23, 59, 59, 999);
    this.loadOrders();
  }

  onCalculateOrders(items: any) {
    console.log(
      '----------------------------------- items -----------------------------------',
    );
    console.log(items);
    console.log(
      '-------------------------------------------------------------------------------',
    );

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
        this.totalAmount += parseInt(item.priceOfFood);
        this.totalOrders += 1;
      } else {
        this.failedOrders.push(item);
      }
    });
    this.totalAmount = +this.totalAmount.toFixed(2);
    this.amountTobePayed = +(this.totalAmount * 0.86).toFixed(2); // calculate 14% of the total food revenue
  }

  ngOnDestroy(): void {
    this.ordersSubscription?.unsubscribe();
  }
}
