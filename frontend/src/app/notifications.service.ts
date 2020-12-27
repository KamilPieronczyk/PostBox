import { Injectable } from '@angular/core';
import {CookieService} from 'ngx-cookie-service'
import { v4 as uuidv4 } from 'uuid';
import { SwPush } from '@angular/service-worker';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  readonly publicVapidKey:string = 'BL0PoiuUFuwDpl2nwta9GAgXwhCzjPkBFZBm-Tf5wzItLwhg5CqNbQWUscBQl7uzZbse-rNVpIklXdmVPIitEzA'
  token: string = ""
  sub?:PushSubscription
  readonly serverURL: string = "https://postbox-server.herokuapp.com//api"
  //readonly serverURL: string = "http://localhost/api"

  constructor(private cookieService:CookieService, private swPush: SwPush,private http: HttpClient) {
    if(this.cookieService.check('token')){
      this.token = this.cookieService.get('token')
    } else {
      this.getToken()
    }
    console.log('token', this.token)
  }

  private getToken(): void {
    this.token = uuidv4()
    this.cookieService.set('token', this.token, 365*2)
  }

  async subscribe() {
    await this.createSub()
  }

  private async createSub(){
    console.log('subscribe')
    if (this.swPush.isEnabled) {
      this.sub = await this.swPush.requestSubscription({
        serverPublicKey: this.publicVapidKey
      })
      this.pushSub()
    } else {
      console.log('not enabled')
      alert('swpush not enabled')
    }
  }

  private async pushSub(){
    let data = {
      token: this.token,
      sub: this.sub
    }
    console.log(JSON.stringify(data))
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    this.http.post(this.serverURL + '/subscribe', JSON.stringify(data), {headers}).subscribe((res)=>{
      console.log("push sent to api")
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding: string = '='.repeat((4 - base64String.length % 4) % 4);
    const base64: string = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData: string = window.atob(base64);
    const outputArray: Uint8Array = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
