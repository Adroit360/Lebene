import { SocketService } from './../services/socket-service.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  private socket: any;
  momoErrorMessage$: Observable<any>;
  constructor(
    private router: Router,
    private socketService: SocketService,
    private http: HttpClient,
    private firestore: AngularFirestore
  ) {
    this.socket = io('https://restaurant-payment-backend.herokuapp.com/');
    this.momoErrorMessage$ = this.firestore
      .collection('messages')
      .valueChanges();
    this.momoErrorMessage$.subscribe((res) => {
      for (let i = 0; i < res.length; i++) {
        if (
          res[i].type === 'momo-error' &&
          res[i].message !== '' &&
          res[i].message !== null
        ) {
          this.momoErrorMessage = res[i].message;
          this.momoError = true;
        }
      }
    });

    // this.socket = io('http://localhost:8000/');
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

  ngOnInit(): void {
    // this.breakTime = this.socketService.getClosingTime();
    // this.http
    //   .get('https://restaurant-payment-backend.herokuapp.com/')
    //   .subscribe((res: any) => {
    //     this.orderStatus = res.orderStatus;
    //     const currentDate = new Date();
    //     const currentTime = currentDate.toString().split(' ')[4].toString();
    //     if (
    //       currentTime < this.breakTime.openingTime ||
    //       currentTime > this.breakTime.closingTime ||
    //       this.orderStatus
    //     ) {
    //       this.closingTimeError = true;
    //     } else {
    //       this.closingTimeError = false;
    //     }
    //   });

    this.http
      .get('https://restaurant-payment-backend.herokuapp.com/')
      .subscribe((res: any) => {
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

    this.foodArray = this.socketService.getAllFoods();
  }

  onProceedToOrderPage(id: number): void {
    // const currentDate = new Date();
    // const currentTime = currentDate.toString().split(' ')[4].toString();
    // if (
    //   currentTime < this.breakTime.openingTime ||
    //   currentTime > this.breakTime.closingTime ||
    //   this.orderStatus
    // ) {
    //   this.closingTimeError = true;
    // } else {
    //   this.closingTimeError = false;
    //   this.router.navigate(['/orders', id]);
    // }
    if (this.orderStatus) {
      this.closingTimeError = true;
    } else {
      this.closingTimeError = false;
      this.router.navigate(['/orders', id]);
    }
  }
}
