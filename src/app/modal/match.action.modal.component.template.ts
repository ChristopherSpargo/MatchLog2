import {Component, Input} from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: 'match.action.modal.component.html'
})

export class MatchActionModalComponentTemplate {
  @Input() title      : string;
  @Input() matchDate  : string;
  @Input() player     : string;
  @Input() opponent   : string;
  @Input() okText     : string;
  @Input() cancelText : string;
  @Input() notifyOnly : boolean;
  @Input() openModal  : boolean;

  constructor(public activeModal: NgbActiveModal) {}

  // call the resolve method after waiting for closing animation
  close = () => {
    this.openModal = false;
    setTimeout( () => {
      this.activeModal.close("OK");
    }, 400)
  }

  // call the resolve method after waiting for closing animation
  dismiss = () => {
    this.openModal = false;
    setTimeout( () => {
      this.activeModal.dismiss("CANCEL");
    }, 400)
  }

}
