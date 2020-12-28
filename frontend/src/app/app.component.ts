import { Component, OnInit } from '@angular/core';
import {faBell} from '@fortawesome/free-solid-svg-icons'
import {PostsService} from './notifications.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'PostBox'
  faBell = faBell
  isSubscribing = false

  constructor(private postsService:PostsService){}

  async ngOnInit() {
    console.log(await this.postsService.isSubscribing())
  }

  async subscribe(){
    await this.postsService.subscribe()
    await this.postsService.isSubscribing()
  }
}
