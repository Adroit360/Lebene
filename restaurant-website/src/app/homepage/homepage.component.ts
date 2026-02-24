import { SocketService } from './../services/socket-service.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { io } from 'socket.io-client';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderDataService } from '../services/order-data.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  private socket: any;
  private readonly apiBaseUrl: string;
  category = 'all foods';
  filters = ['all foods', 'beans', 'rice', 'banku'];
  readonly freeDeliveryPromoToken = 'vals';
  readonly freeDeliveryPromoStorageKey = 'freeDeliveryPromo';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private socketService: SocketService,
    private http: HttpClient,
    private orderDataService: OrderDataService,
  ) {
    this.apiBaseUrl = this.orderDataService.getApiBaseUrl();
    this.socket = io(this.apiBaseUrl);
  }

  foodArray: any;
  closingTime: string = '';
  currentTime: string = '';
  public orderStatus: boolean = false;
  breakTime: { closingTime: string; openingTime: string } = {
    closingTime: '',
    openingTime: '',
  };
  closingTimeError = false;
  subscription: Subscription = new Subscription();
  momoErrorMessage = '';
  momoError = false;
  day = new Date().getDay();

  private isFreeDeliveryWindow(): boolean {
    const now = new Date();
    return (
      now.getFullYear() === 2026 && now.getMonth() === 1 && now.getDate() === 14
    );
  }

  ngOnInit(): void {
    const promoParam = this.route.snapshot.queryParamMap
      .get('promo')
      ?.toLowerCase();
    if (
      promoParam === this.freeDeliveryPromoToken &&
      this.isFreeDeliveryWindow()
    ) {
      localStorage.setItem(
        this.freeDeliveryPromoStorageKey,
        this.freeDeliveryPromoToken,
      );
    } else if (!this.isFreeDeliveryWindow()) {
      localStorage.removeItem(this.freeDeliveryPromoStorageKey);
    }

    this.http.get(`${this.apiBaseUrl}/`).subscribe((res: any) => {
      this.orderStatus = res.orderStatus;
      if (this.orderStatus || this.day === 0) {
        this.closingTimeError = true;
      } else {
        this.closingTimeError = false;
      }
    });

    this.socket.on('orderStatus', (res: { orderStatus: boolean }) => {
      this.orderStatus = res.orderStatus;
      if (res.orderStatus) {
        this.closingTimeError = true;
      } else {
        this.closingTimeError = false;
      }
    });

    this.foodArray = this.socketService.getFoodByCategory(this.category);
  }

  // @HostListener('window:scroll', ['$event']) // for window scroll events
  // onScroll(event: any) {
  //   console.log('scroll top: ', document.body.scrollTop);
  //   console.log('document top: ', document.documentElement.scrollTop); //630px
  //   //console.log(event);
  // }

  onProceedToOrderPage(id: number): void {
    if (this.orderStatus || this.day === 0) {
      this.closingTimeError = true;
    } else {
      this.closingTimeError = false;
      this.router.navigate(['/orders', id]);
    }
  }

  onSelectFilter(item: string) {
    this.category = item;
    this.foodArray = this.socketService.getFoodByCategory(item);
  }
}
