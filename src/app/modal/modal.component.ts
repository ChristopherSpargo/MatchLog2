import {Component, Input} from '@angular/core';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SimpleModalComponentTemplate } from './simple.modal.component.template'
import { MatchActionModalComponentTemplate } from './match.action.modal.component.template'
import { PublicMatchSettingsModalComponentTemplate } from './public.match.settings.modal.component.template';
import { LogsPointFilterModalComponentTemplate } from './logs.point.filter.modal.component.template';

@Component({
  selector: 'app-modal',
  template: "<ng-content></ng-content>"
})

export class ModalComponent {

  constructor(private modalService: NgbModal) {}

  simpleOpen(title: string, content: string, cancelText: string, okText: string) : Promise<any> {
    const modalRef = this.modalService.open(SimpleModalComponentTemplate, {size: 'lg'});
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

  matchActionOpen(title: string, player: string, opponent: string, matchDate: string, 
                  cancelText: string, okText: string) : Promise<any> {
    const modalRef = this.modalService.open(MatchActionModalComponentTemplate, {size: 'lg'});
    modalRef.componentInstance.title      = title;
    modalRef.componentInstance.player     = player;
    modalRef.componentInstance.opponent   = opponent;
    modalRef.componentInstance.matchDate  = matchDate;
    modalRef.componentInstance.cancelText = cancelText;
    modalRef.componentInstance.okText     = okText;
    modalRef.componentInstance.notifyOnly = cancelText == "";
    setTimeout( ()=> {
      modalRef.componentInstance.openModal  = true;
    }, 100);
    return modalRef.result;
  }

  publicSettingsOpen(title: string, emailList: string[], player: string, opponent: string,
     matchDate: string, mode: string, toggleAbout: Function, okText ?: string, deleteText ?: string, cancelText ?: string) : Promise<any> {
    const modalRef = this.modalService.open(PublicMatchSettingsModalComponentTemplate, 
                                                            {size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.mode       = mode;
    modalRef.componentInstance.title      = title;
    modalRef.componentInstance.itemList   = emailList;
    modalRef.componentInstance.player     = player;
    modalRef.componentInstance.opponent   = opponent;
    modalRef.componentInstance.matchDate  = matchDate;
    modalRef.componentInstance.cancelText = cancelText || "Cancel";
    modalRef.componentInstance.okText     = okText || "Save";
    modalRef.componentInstance.deleteText = deleteText || "Make Private";
    modalRef.componentInstance.toggleAbout = toggleAbout;
    setTimeout( ()=> {
      modalRef.componentInstance.openModal  = true;
    }, 100);
    return modalRef.result;
  }

  pointFilterOpen(title : string, pointFilterInfo : any, okText : string, clearText : string, cancelText : string,
                  toggleAbout : Function) : Promise<any> {
    const modalRef = this.modalService.open(LogsPointFilterModalComponentTemplate, 
                                                            {size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.title          = title;
    modalRef.componentInstance.pointInfo      = pointFilterInfo;
    modalRef.componentInstance.cancelText     = cancelText;
    modalRef.componentInstance.clearText      = clearText;
    modalRef.componentInstance.okText         = okText;
    modalRef.componentInstance.toggleAbout    = toggleAbout;
    setTimeout( ()=> {
      modalRef.componentInstance.openModal  = true;
    }, 100);
    return modalRef.result;
  }

}