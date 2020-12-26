import { Component, OnInit } from '@angular/core';
import {faBell} from '@fortawesome/free-solid-svg-icons'
import {NotificationsService} from './notifications.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'PostBox'
  faBell = faBell

  constructor(private notificationsService:NotificationsService){}

  ngOnInit(): void {

  }

  subscribe(){
    this.notificationsService.subscribe()
  }
}
