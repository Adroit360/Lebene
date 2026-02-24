import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrderDetailsAdmin } from '../models/interface';

interface MessageItem {
  type: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderDataService {
  private readonly baseUrl =
    environment.production ||
    !['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'https://hubres.azurewebsites.net'
      : 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getApiBaseUrl(): string {
    return this.baseUrl;
  }

  getMomoMessages(): Observable<MessageItem[]> {
    return this.http.get<MessageItem[]>(`${this.baseUrl}/api/messages`);
  }

  getOrders(
    startDate: number,
    endDate: number,
  ): Observable<OrderDetailsAdmin[]> {
    const params = new HttpParams()
      .set('startDate', String(startDate))
      .set('endDate', String(endDate));

    return this.http.get<OrderDetailsAdmin[]>(`${this.baseUrl}/api/orders`, {
      params,
    });
  }

  updateOrder(
    id: string,
    data: { completed: boolean },
  ): Observable<OrderDetailsAdmin> {
    return this.http.patch<OrderDetailsAdmin>(
      `${this.baseUrl}/api/orders/${id}`,
      data,
    );
  }

  deleteOrder(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.baseUrl}/api/orders/${id}`,
    );
  }
}
