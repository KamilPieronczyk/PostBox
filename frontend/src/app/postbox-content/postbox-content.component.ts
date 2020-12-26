import { Component, OnInit } from '@angular/core';
import {faEnvelopeOpenText} from '@fortawesome/free-solid-svg-icons'
@Component({
  selector: 'app-postbox-content',
  templateUrl: './postbox-content.component.html',
  styleUrls: ['./postbox-content.component.sass']
})
export class PostboxContentComponent implements OnInit {
  empty = false
  faEnvelopeOpenText = faEnvelopeOpenText

  constructor() { }

  ngOnInit(): void {

  }

}
