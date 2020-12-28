import { Injectable } from '@angular/core';
import {CookieService} from 'ngx-cookie-service'
import { v4 as uuidv4 } from 'uuid';
import { SwPush } from '@angular/service-worker';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment'
import { analyzeFileForInjectables } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  readonly publicVapidKey:string = 'BL0PoiuUFuwDpl2nwta9GAgXwhCzjPkBFZBm-Tf5wzItLwhg5CqNbQWUscBQl7uzZbse-rNVpIklXdmVPIitEzA'
  token: string = ""
  sub?:PushSubscription
  readonly serverURL: string = environment.API_URL

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

  async isSubscribing(){
    const params = new HttpParams().set('token', this.token)
    try {
      let res: any = await this.http.get(this.serverURL + '/isSubscribing', {params: params}).toPromise();
      return res.isSubscribing;
    } catch (error) {
      console.error('isSubscribing error', error)
      return false;
    }
  }

  async getPosts(){
    try {
      let res: any = await this.http.get(this.serverURL + '/posts').toPromise();
      return res.value;
    } catch (error) {
      console.error('getPosts error', error)
      return 0;
    }
  }

  async deletePosts(){
    try {
      let res: any = await this.http.delete(this.serverURL + '/posts').toPromise();
      return true;
    } catch (error) {
      console.error('deletePosts error', error)
      return false;
    }
  }
}
