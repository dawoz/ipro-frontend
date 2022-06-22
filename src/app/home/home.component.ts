import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  queries = [
    'List albums of a band',
    'List genres of an album',
    'List albums by genre',
    'List genres that use a particular instrument',
    'List genres that influenced another genre',
    'List tracks of an album',
    'List genre evolution of a band',
    'List instruments used in a particular genre',
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
