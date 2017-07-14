import {Component, Input} from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: 'modal.component.html'
})

export class ModalComponentTemplate {
  @Input() title      : string;
  @Input() content    : string;
  @Input() okText     : string;
  @Input() cancelText : string;
  @Input() notifyOnly : boolean;
  @Input() openModal  : boolean;

  constructor(public activeModal: NgbActiveModal) {}
}

@Component({
  selector: 'app-modal',
  template: "<ng-content></ng-content>"
})

export class ModalComponent {

  constructor(private modalService: NgbModal) {}

  open(title: string, content: string, cancelText: string, okText: string) : Promise<any> {
    const modalRef = this.modalService.open(ModalComponentTemplate, {size: 'sm'});
    modalRef.componentInstance.title      = title;
    modalRef.componentInstance.content    = content;
    modalRef.componentInstance.cancelText = cancelText;
    modalRef.componentInstance.okText     = okText;
    modalRef.componentInstance.notifyOnly = cancelText == "";
    setTimeout( ()=> {
      modalRef.componentInstance.openModal  = true;
    }, 100);
    return modalRef.result;
  }
}