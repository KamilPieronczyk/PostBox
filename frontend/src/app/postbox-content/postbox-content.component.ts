import { Component, OnInit } from '@angular/core';
import {faEnvelopeOpenText} from '@fortawesome/free-solid-svg-icons'
import {PostsService} from '../notifications.service'

@Component({
  selector: 'app-postbox-content',
  templateUrl: './postbox-content.component.html',
  styleUrls: ['./postbox-content.component.sass']
})
export class PostboxContentComponent implements OnInit {
  faEnvelopeOpenText = faEnvelopeOpenText
  posts = 0

  constructor(private postsService: PostsService) { }

  async ngOnInit() {
    await this.getPosts()
  }

  async getPosts(){
    this.posts = await this.postsService.getPosts();
  }

  async deletePosts(){
    await this.postsService.deletePosts();
    await this.getPosts()
  }

}
