import { Component } from '@angular/core';
import {UIROUTER_DIRECTIVES} from '@uirouter/angular';
import { ToasterConfig } from 'angular2-toaster';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent {
  dialogOpen : boolean = false;
  public toastConfig : ToasterConfig = new ToasterConfig({
    positionClass: 'toast-bottom-left'
  });

  constructor(){
    window.addEventListener("openDialog", this.openDialog);
    window.addEventListener("closeDialog", this.closeDialog);
  };

  openDialog(){
    this.dialogOpen = true;
  }

  closeDialog(){
    this.dialogOpen = false;
  }
}
