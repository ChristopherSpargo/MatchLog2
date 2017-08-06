import { Component, OnInit } from '@angular/core';
import { UIROUTER_DIRECTIVES } from '@uirouter/angular';
import { ToasterConfig } from 'angular2-toaster';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {

  public toastConfig : ToasterConfig = new ToasterConfig({
    positionClass: 'toast-bottom-left'
  });

  constructor(){};

  ngOnInit() {
    document.addEventListener("tryit", this.onTryit);
  }

  onTryit = (e) => {
    alert(e.detail.serve);
  }
}
