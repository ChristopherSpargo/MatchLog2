import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {  NgForm } from "@angular/forms";

@Component({
  selector: '<app-icon-input>',
  templateUrl : 'icon.input.component.html'
})
export class IconInputComponent implements OnInit {
  focused: boolean = false;
  aErrors: string[];
  aMsgs:   string[];

  @Input() fName        : string;   // unique name for field
  @Input() fCheckAll    : boolean;  // flag to check all fields for errors (not just touched fields)
  @Input() fRef         : string;   // unique name for Template Reference Variable for this field
  @Input() fForm        : NgForm;   // name of Template Reference Variable for form this input belongs to
  @Input() fRequired    : boolean = false;  // if input is required
  @Input() fDisabled    : boolean = false;  // when input should be disabled
  @Input() fReadonly    : boolean = false;  // if the field is readonly
  @Input() fType        : string;   // input type (password, email,..)
  @Input() fLabel       : string;   // label for input
  @Input() fIcon        : string = "";   // icon for input
  @Input() fColor       : string;   // color for icon
  @Input() fValue       : string;   // model for this field
  @Input() fErrors      : string;   // array of error key names
  @Input() fErrorMsgs   : string;   // array of messages for the error keys
  @Input() fErrorMulti  : string;   // 'true' if allow multiple error messages
  @Input() fMinlength   : string;   // value for minlength (if any)
  @Input() fMaxlength   : string;   // value for maxlength (if any)
  @Input() fPattern     : string;   // value for pattern (if any)
  @Input() fFocusFn     : Function; // function to execute on focus
  @Input() fOnInput     : Function; // function to execute on input
  @Input() fExtraCSS    : string;   // CSS classes to add to main div
  @Input() fCapitalize  : boolean = false; // true if input should be capitalized
  @Output() fValueChange = new EventEmitter<string>();


  constructor() {
  };
  
  ngOnInit() {
    if(this.fErrors){
      this.aErrors = this.fErrors.split('|');
    }
    if(this.fErrorMsgs){
      this.aMsgs = this.fErrorMsgs.split('|');
    }
  }

  showFocused = ()=> {
    this.focused = true;
    if(this.fFocusFn){ this.fFocusFn(); }
  }

  showNotFocused = ()=> {
    this.focused = false;
  }

  valueChange = ()=> {
    if(this.fCapitalize){
      this.fValue = this.fValue.charAt(0).toUpperCase()+this.fValue.substr(1); 
    }
    this.fValueChange.emit(this.fValue);
    if(this.fOnInput){ this.fOnInput(); }
  }
}
